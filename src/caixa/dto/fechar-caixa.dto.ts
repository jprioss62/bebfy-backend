import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FecharCaixaDto {
  @IsNumber(
    {},
    { message: 'O saldo informado em dinheiro deve ser um valor numérico.' },
  )
  @Min(0, { message: 'O saldo informado não pode ser negativo.' })
  @IsNotEmpty({
    message: 'O valor em dinheiro contado na gaveta é obrigatório.',
  })
  saldoInformadoDinheiro: number;

  @IsString({ message: 'A observação deve ser um texto.' })
  @IsOptional()
  observacoes?: string;
}
