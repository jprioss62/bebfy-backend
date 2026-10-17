import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { TipoMovimentacaoEstoque } from '@prisma/client';

export class CreateMovimentacaoEstoqueDto {
  @IsInt({ message: 'O ID do produto deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
  produtoId: number;

  @IsEnum(TipoMovimentacaoEstoque, {
    message: 'Tipo de movimentação inválido.',
  })
  @IsNotEmpty({ message: 'O tipo da movimentação é obrigatório.' })
  tipo: TipoMovimentacaoEstoque;

  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
  quantidade: number;

  @IsString({ message: 'O motivo deve ser um texto.' })
  @IsOptional()
  motivo?: string;

  @IsString({ message: 'A observação deve ser um texto.' })
  @IsOptional()
  observacao?: string;
}
