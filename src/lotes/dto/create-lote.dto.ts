import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateLoteDto {
  // ID do produto agora é Int/number
  @IsInt({ message: 'O ID do produto deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
  produtoId: number;

  @IsNumber({}, { message: 'A quantidade deve ser um valor numérico.' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero.' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
  quantidade: number;

  @IsString({ message: 'O número do lote deve ser um texto.' })
  @IsNotEmpty({ message: 'O número do lote é obrigatório.' })
  numeroLote: string;

  @IsDateString(
    {},
    { message: 'A data de vencimento deve ser uma data válida.' },
  )
  @IsOptional()
  dataVencimento?: string;
}
