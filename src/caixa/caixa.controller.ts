// Importamos os decoradores do NestJS e a proteção por autenticação JWT
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { AbrirCaixaDto } from './dto/abrir-caixa.dto';
import { MovimentacaoCaixaDto } from './dto/movimentacao-caixa.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  // POST /caixa/abrir -> Abre o turno do operador
  @Post('abrir')
  abrirCaixa(@Body() dto: AbrirCaixaDto) {
    return this.caixaService.abrirCaixa(dto);
  }

  // POST /caixa/:id/movimentacao -> Registra Sangria ou Suprimento
  @Post(':id/movimentacao')
  registrarMovimentacao(
    @Param('id') id: string,
    @Body() dto: MovimentacaoCaixaDto,
  ) {
    return this.caixaService.registrarMovimentacao(id, dto);
  }

  // POST /caixa/:id/fechar -> Conclui o fechamento com apuração de quebra
  @Post(':id/fechar')
  fecharCaixa(@Param('id') id: string, @Body() dto: FecharCaixaDto) {
    return this.caixaService.fecharCaixa(id, dto);
  }

  // GET /caixa/operador/:operadorId/aberto
  @Get('operador/:operadorId/aberto')
  findCaixaAbertoOperador(@Param('operadorId') operadorId: string) {
    return this.caixaService.findCaixaAbertoOperador(operadorId);
  }

  // GET /caixa -> Histórico de todos os caixas
  @Get()
  findAll() {
    return this.caixaService.findAll();
  }

  // GET /caixa/:id -> Detalhes completos do caixa
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caixaService.findOne(id);
  }
}
