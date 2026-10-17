// Importamos os recursos do NestJS e os enums do Prisma
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirCaixaDto } from './dto/abrir-caixa.dto';
import { MovimentacaoCaixaDto } from './dto/movimentacao-caixa.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';
import { StatusCaixa, TipoMovimentacaoCaixa } from '@prisma/client';

@Injectable()
export class CaixaService {
  // Injeta a instância do PrismaService para interagir com as tabelas de Caixa e Movimentação
  constructor(private readonly prisma: PrismaService) {}

  // Abre uma nova sessão de caixa para um operador
  async abrirCaixa(dto: AbrirCaixaDto) {
    // 1. Verifica se o funcionário existe e está ativo
    const operador = await this.prisma.funcionario.findUnique({
      where: { id: dto.operadorId },
    });

    if (!operador) {
      throw new NotFoundException('Operador informado não foi encontrado.');
    }

    if (!operador.ativo) {
      throw new BadRequestException(
        'Este funcionário está inativo e não pode abrir caixa.',
      );
    }

    // 2. Impede que o mesmo operador abra dois caixas simultaneamente
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: {
        operadorId: dto.operadorId,
        status: StatusCaixa.ABERTO,
      },
    });

    if (caixaAberto) {
      throw new BadRequestException(
        'Este operador já possui uma sessão de caixa aberta no momento.',
      );
    }

    // 3. Cria o registro do caixa aberto
    return this.prisma.caixa.create({
      data: {
        operadorId: dto.operadorId,
        saldoInicial: dto.saldoInicial,
        status: StatusCaixa.ABERTO,
      },
      include: {
        operador: {
          select: {
            id: true,
            nome: true,
            cargo: true,
          },
        },
      },
    });
  }

  // Registra sangrias (retiradas) ou suprimentos (entradas) de dinheiro na gaveta
  async registrarMovimentacao(caixaId: string, dto: MovimentacaoCaixaDto) {
    // 1. Localiza o caixa e garante que está aberto
    const caixa = await this.prisma.caixa.findUnique({
      where: { id: caixaId },
      include: { movimentacoes: true },
    });

    if (!caixa) {
      throw new NotFoundException(`Caixa com ID ${caixaId} não encontrado.`);
    }

    if (caixa.status !== StatusCaixa.ABERTO) {
      throw new BadRequestException(
        'Não é possível movimentar um caixa que já foi fechado.',
      );
    }

    // 2. Cria a movimentação vinculada ao caixa
    return this.prisma.movimentacaoCaixa.create({
      data: {
        caixaId,
        tipo: dto.tipo,
        valor: dto.valor,
        categoria: dto.categoria,
        observacao: dto.observacao,
      },
    });
  }

  // Fecha o caixa, calcula o total previsto pelo sistema e apura a quebra de caixa
  async fecharCaixa(caixaId: string, dto: FecharCaixaDto) {
    const caixa = await this.prisma.caixa.findUnique({
      where: { id: caixaId },
      include: {
        movimentacoes: true,
        vendas: {
          include: { pagamentos: true },
        },
      },
    });

    if (!caixa) {
      throw new NotFoundException(`Caixa com ID ${caixaId} não encontrado.`);
    }

    if (caixa.status === StatusCaixa.FECHADO) {
      throw new BadRequestException('Este caixa já se encontra fechado.');
    }

    // 1. Inicia o cálculo com o fundo de troco inicial
    let saldoPrevistoSistema = Number(caixa.saldoInicial);

    // 2. Soma suprimentos e subtrai sangrias
    for (const mov of caixa.movimentacoes) {
      const valor = Number(mov.valor);
      if (mov.tipo === TipoMovimentacaoCaixa.SUPRIMENTO) {
        saldoPrevistoSistema += valor;
      } else {
        saldoPrevistoSistema -= valor;
      }
    }

    // 3. Soma apenas pagamentos efetuados em DINHEIRO nas vendas deste caixa
    for (const venda of caixa.vendas) {
      for (const pag of venda.pagamentos) {
        if (pag.formaPagamento === 'DINHEIRO') {
          // Subtrai o troco devolvido ao cliente caso exista
          const valorLiquido = Number(pag.valor) - Number(pag.troco);
          saldoPrevistoSistema += valorLiquido;
        }
      }
    }

    // 4. Calcula a quebra de caixa: (Físico contado) - (Previsto pelo Sistema)
    // Valor positivo = sobra de caixa; valor negativo = falta de caixa
    const quebraDeCaixa = dto.saldoFinalFisico - saldoPrevistoSistema;

    // 5. Atualiza o caixa para o status FECHADO e grava os saldos consolidados
    return this.prisma.caixa.update({
      where: { id: caixaId },
      data: {
        status: StatusCaixa.FECHADO,
        saldoFinalSistema: saldoPrevistoSistema,
        saldoFinalFisico: dto.saldoFinalFisico,
        quebraDeCaixa: quebraDeCaixa,
        fechadoEm: new Date(),
      },
      include: {
        operador: true,
        movimentacoes: true,
      },
    });
  }

  // Busca o caixa atualmente aberto de um operador
  async findCaixaAbertoOperador(operadorId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: {
        operadorId,
        status: StatusCaixa.ABERTO,
      },
      include: {
        movimentacoes: true,
        operador: {
          select: { id: true, nome: true, cargo: true },
        },
      },
    });

    if (!caixa) {
      throw new NotFoundException(
        'Nenhum caixa aberto encontrado para este operador.',
      );
    }

    return caixa;
  }

  // Lista todos os caixas registados na distribuidora
  async findAll() {
    return this.prisma.caixa.findMany({
      include: {
        operador: {
          select: { id: true, nome: true, cargo: true },
        },
      },
      orderBy: { abertoEm: 'desc' },
    });
  }

  // Consulta um caixa específico por ID com todas as movimentações e vendas associadas
  async findOne(id: string) {
    const caixa = await this.prisma.caixa.findUnique({
      where: { id },
      include: {
        operador: true,
        movimentacoes: {
          orderBy: { criadoEm: 'desc' },
        },
        vendas: {
          orderBy: { criadoEm: 'desc' },
          include: {
            itens: true,
            pagamentos: true,
          },
        },
      },
    });

    if (!caixa) {
      throw new NotFoundException(`Caixa com ID ${id} não encontrado.`);
    }

    return caixa;
  }
}
