import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusCaixa, TipoMovimentacaoCaixa } from '@prisma/client';
import { SangriaSuprimentoDto } from './dto/sangria-suprimento.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';

@Injectable()
export class CaixaService {
  constructor(private readonly prisma: PrismaService) {}

  async abrirCaixa(operadorId: string, saldoInicial: number = 0) {
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: {
        operadorId,
        status: StatusCaixa.ABERTO,
      },
    });

    if (caixaAberto) {
      throw new BadRequestException(
        'Este operador já possui uma sessão de caixa aberta.',
      );
    }

    return this.prisma.caixa.create({
      data: {
        operadorId,
        saldoInicial,
        status: StatusCaixa.ABERTO,
      },
    });
  }

  async findCaixaAbertoOperador(operadorId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: {
        operadorId,
        status: StatusCaixa.ABERTO,
      },
    });

    if (!caixa) {
      throw new NotFoundException(
        'Nenhum caixa aberto encontrado para este operador.',
      );
    }

    return caixa;
  }

  async findAll() {
    return this.prisma.caixa.findMany({
      include: {
        operador: true,
        movimentacoes: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    const caixa = await this.prisma.caixa.findUnique({
      where: { id },
      include: {
        operador: true,
        movimentacoes: true,
        vendas: {
          include: {
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

  // --- SUPRIMENTO (Entrada de Troco) ---
  async suprimento(caixaId: string, dto: SangriaSuprimentoDto) {
    const caixa = await this.prisma.caixa.findUnique({
      where: { id: caixaId },
    });

    if (!caixa) {
      throw new NotFoundException('Caixa informado não foi encontrado.');
    }

    if (caixa.status !== StatusCaixa.ABERTO) {
      throw new BadRequestException(
        'Não é possível adicionar suprimento em um caixa fechado.',
      );
    }

    return this.prisma.movimentacaoCaixa.create({
      data: {
        caixaId,
        tipo: TipoMovimentacaoCaixa.SUPRIMENTO,
        valor: dto.valor,
        categoria: 'SUPRIMENTO',
        observacao: dto.motivo,
      },
    });
  }

  // --- SANGRIA (Retirada de Dinheiro para o Cofre) ---
  async sangria(caixaId: string, dto: SangriaSuprimentoDto) {
    const caixa = await this.findOne(caixaId);

    if (caixa.status !== StatusCaixa.ABERTO) {
      throw new BadRequestException(
        'Não é possível realizar sangria em um caixa fechado.',
      );
    }

    // Calcula saldo em dinheiro disponível na gaveta
    const saldoInicial = Number(caixa.saldoInicial);

    const totalSuprimentos = caixa.movimentacoes
      .filter((m) => m.tipo === TipoMovimentacaoCaixa.SUPRIMENTO)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const totalSangrias = caixa.movimentacoes
      .filter((m) => m.tipo === TipoMovimentacaoCaixa.SANGRIA)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const totalVendasDinheiro = caixa.vendas
      .flatMap((v) => v.pagamentos)
      .filter((p) => p.formaPagamento === 'DINHEIRO')
      .reduce((acc, p) => acc + Number(p.valor), 0);

    const saldoDinheiroGaveta =
      saldoInicial + totalSuprimentos + totalVendasDinheiro - totalSangrias;

    if (dto.valor > saldoDinheiroGaveta) {
      throw new BadRequestException(
        `Saldo insuficiente em dinheiro na gaveta para sangria. Disponível: R$ ${saldoDinheiroGaveta.toFixed(2)}`,
      );
    }

    return this.prisma.movimentacaoCaixa.create({
      data: {
        caixaId,
        tipo: TipoMovimentacaoCaixa.SANGRIA,
        valor: dto.valor,
        categoria: 'SANGRIA',
        observacao: dto.motivo,
      },
    });
  }

  // --- FECHAMENTO CEGO DE CAIXA ---
  async fecharCaixa(caixaId: string, dto: FecharCaixaDto) {
    const caixa = await this.findOne(caixaId);

    if (caixa.status !== StatusCaixa.ABERTO) {
      throw new BadRequestException('Este caixa já se encontra fechado.');
    }

    const saldoInicial = Number(caixa.saldoInicial);

    const totalSuprimentos = caixa.movimentacoes
      .filter((m) => m.tipo === TipoMovimentacaoCaixa.SUPRIMENTO)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const totalSangrias = caixa.movimentacoes
      .filter((m) => m.tipo === TipoMovimentacaoCaixa.SANGRIA)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const totalVendasDinheiro = caixa.vendas
      .flatMap((v) => v.pagamentos)
      .filter((p) => p.formaPagamento === 'DINHEIRO')
      .reduce((acc, p) => acc + Number(p.valor), 0);

    // Saldo esperado em espécie calculado pelo sistema
    const saldoFinalSistema =
      saldoInicial + totalSuprimentos + totalVendasDinheiro - totalSangrias;
    const saldoFinalFisico = Number(dto.saldoInformadoDinheiro);

    // Diferença: Se positivo -> Sobra; Se negativo -> Falta / Quebra
    const quebraDeCaixa = saldoFinalFisico - saldoFinalSistema;

    const caixaFechado = await this.prisma.caixa.update({
      where: { id: caixaId },
      data: {
        status: StatusCaixa.FECHADO,
        fechadoEm: new Date(),
        saldoFinalSistema,
        saldoFinalFisico,
        quebraDeCaixa,
      },
    });

    return {
      caixaId: caixaFechado.id,
      operadorId: caixaFechado.operadorId,
      status: caixaFechado.status,
      abertoEm: caixaFechado.abertoEm,
      fechadoEm: caixaFechado.fechadoEm,
      resumoFinanceiroDinheiro: {
        saldoInicial,
        vendasDinheiro: totalVendasDinheiro,
        suprimentos: totalSuprimentos,
        sangrias: totalSangrias,
        saldoEsperadoSistema: saldoFinalSistema,
        saldoInformadoOperador: saldoFinalFisico,
        diferenca: quebraDeCaixa,
        diagnostico:
          quebraDeCaixa === 0
            ? 'Caixa fechado sem divergências.'
            : quebraDeCaixa > 0
              ? `Sobra de caixa: R$ ${quebraDeCaixa.toFixed(2)}`
              : `Quebra/Falta de caixa: R$ ${Math.abs(quebraDeCaixa).toFixed(2)}`,
      },
    };
  }
}
