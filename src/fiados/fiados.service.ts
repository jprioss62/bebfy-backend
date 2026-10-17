// Importamos os decoradores e exceções de controle do NestJS
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Importamos o PrismaService e o enum do Prisma
import { PrismaService } from '../prisma/prisma.service';
import { CreateFiadoDto } from './dto/create-fiado.dto';
import { TipoTransacaoFiado } from '@prisma/client';

@Injectable()
export class FiadosService {
  // Injeta a instância do PrismaService no construtor
  constructor(private readonly prisma: PrismaService) {}

  // Cria uma transação de fiado (DÉBITO ou CRÉDITO) com cálculo de saldo e auditoria
  async create(createFiadoDto: CreateFiadoDto) {
    // 1. Localiza o cliente no banco de dados
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createFiadoDto.clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente informado não foi encontrado.');
    }

    const saldoAtual = Number(cliente.saldoDevedor);
    const limiteCredito = Number(cliente.limiteCredito);
    const valorOperacao = createFiadoDto.valor;

    let novoSaldo: number;

    // 2. Validações de regra de negócio conforme o tipo de operação
    if (createFiadoDto.tipo === TipoTransacaoFiado.DEBITO) {
      // DÉBITO: O cliente está a adquirir produtos fiado (aumenta o que deve)
      novoSaldo = saldoAtual + valorOperacao;

      // Se o cliente tem um limite configurado (> 0), valida se a nova dívida ultrapassa o teto
      if (limiteCredito > 0 && novoSaldo > limiteCredito) {
        throw new BadRequestException(
          `Operação bloqueada: Limite de crédito excedido. Limite: R$ ${limiteCredito.toFixed(2)} | Saldo atual: R$ ${saldoAtual.toFixed(2)} | Tentativa: R$ ${valorOperacao.toFixed(2)}`,
        );
      }
    } else {
      // CRÉDITO: O cliente está a pagar/abater a dívida
      novoSaldo = saldoAtual - valorOperacao;

      // Impede pagamentos maiores que o saldo devedor atual
      if (saldoAtual <= 0) {
        throw new BadRequestException(
          'Este cliente não possui saldo devedor em aberto para abater.',
        );
      }

      if (novoSaldo < 0) {
        throw new BadRequestException(
          `O valor do pagamento (R$ ${valorOperacao.toFixed(2)}) é maior que a dívida atual (R$ ${saldoAtual.toFixed(2)}).`,
        );
      }
    }

    // 3. Executa a gravação no histórico e a atualização do saldo dentro de uma transação atómica
    return this.prisma.$transaction(async (tx) => {
      // Regista o evento no histórico de fiados com o saldo resultante (saldoApos)
      const historico = await tx.historicoFiado.create({
        data: {
          clienteId: cliente.id,
          tipo: createFiadoDto.tipo,
          valor: valorOperacao,
          descricao:
            createFiadoDto.descricao ||
            (createFiadoDto.tipo === TipoTransacaoFiado.CREDITO
              ? 'Pagamento de fiado'
              : 'Lançamento manual de débito'),
          vendaId: createFiadoDto.vendaId || null,
          saldoApos: novoSaldo,
        },
        include: {
          cliente: true,
        },
      });

      // Atualiza o saldo devedor atual na ficha cadastral do cliente
      await tx.cliente.update({
        where: { id: cliente.id },
        data: {
          saldoDevedor: novoSaldo,
        },
      });

      return historico;
    });
  }

  // Lista todos os registos de fiado da distribuidora (auditoria geral)
  async findAll() {
    return this.prisma.historicoFiado.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            saldoDevedor: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  // Gera o extrato completo da conta corrente de fiado de um cliente específico
  async findByCliente(clienteId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente com o ID ${clienteId} não foi encontrado.`,
      );
    }

    const historico = await this.prisma.historicoFiado.findMany({
      where: { clienteId },
      orderBy: { criadoEm: 'desc' },
      include: {
        venda: {
          select: {
            id: true,
            codigoVenda: true,
            valorTotal: true,
            criadoEm: true,
          },
        },
      },
    });

    return {
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        cpfCnpj: cliente.cpfCnpj,
        telefone: cliente.telefone,
        limiteCredito: cliente.limiteCredito,
        saldoDevedor: cliente.saldoDevedor,
        cascosEmPosse: cliente.cascosEmPosse,
      },
      extrato: historico,
    };
  }

  // Procura um registo de fiado específico pelo seu ID
  async findOne(id: string) {
    const registro = await this.prisma.historicoFiado.findUnique({
      where: { id },
      include: {
        cliente: true,
        venda: true,
      },
    });

    if (!registro) {
      throw new NotFoundException(
        `Registo de fiado com ID ${id} não foi encontrado.`,
      );
    }

    return registro;
  }

  // Remove um registo de fiado e estorna automaticamente o saldo da conta do cliente
  async remove(id: string) {
    const registro = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const valor = Number(registro.valor);
      // Se era DÉBITO, remover o registo diminui a dívida (-valor)
      // Se era CRÉDITO (pagamento), remover o registo reativa a dívida (+valor)
      const ajuste =
        registro.tipo === TipoTransacaoFiado.DEBITO ? -valor : valor;

      await tx.cliente.update({
        where: { id: registro.clienteId },
        data: {
          saldoDevedor: {
            increment: ajuste,
          },
        },
      });

      return tx.historicoFiado.delete({
        where: { id },
      });
    });
  }
}
