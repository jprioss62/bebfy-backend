import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SangriaSuprimentoDto } from './dto/sangria-suprimento.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';

@UseGuards(JwtAuthGuard)
@Controller('caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  @Post('abrir')
  abrirCaixa(@Body() body: { operadorId: string; saldoInicial?: number }) {
    return this.caixaService.abrirCaixa(body.operadorId, body.saldoInicial);
  }

  @Get(['operador/:operadorId/aberto', 'aberto/operador/:operadorId'])
  findCaixaAbertoOperador(@Param('operadorId') operadorId: string) {
    return this.caixaService.findCaixaAbertoOperador(operadorId);
  }

  @Get()
  findAll() {
    return this.caixaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caixaService.findOne(id);
  }

  @Post(':id/suprimento')
  suprimento(@Param('id') id: string, @Body() dto: SangriaSuprimentoDto) {
    return this.caixaService.suprimento(id, dto);
  }

  @Post(':id/sangria')
  sangria(@Param('id') id: string, @Body() dto: SangriaSuprimentoDto) {
    return this.caixaService.sangria(id, dto);
  }

  @Post(':id/fechar')
  fecharCaixa(@Param('id') id: string, @Body() dto: FecharCaixaDto) {
    return this.caixaService.fecharCaixa(id, dto);
  }
}
