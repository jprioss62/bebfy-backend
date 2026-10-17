// Validador do valor físico apurado pelo operador na gaveta
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class FecharCaixaDto {
  // Total em dinheiro físico contado manualmente na gaveta na hora do fecho
  @IsNumber({}, { message: 'O saldo final físico deve ser um valor numérico.' })
  @Min(0, { message: 'O saldo físico não pode ser negativo.' })
  @IsNotEmpty({ message: 'O saldo final físico é obrigatório.' })
  saldoFinalFisico: number;
}
