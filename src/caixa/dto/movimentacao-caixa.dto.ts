// Importamos os validadores e o enum oficial do Prisma
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TipoMovimentacaoCaixa } from '@prisma/client';

export class MovimentacaoCaixaDto {
  // Tipo da operação: SUPRIMENTO (entrada de troco) ou SANGRIA (retirada de dinheiro)
  @IsEnum(TipoMovimentacaoCaixa, {
    message: 'O tipo deve ser SUPRIMENTO ou SANGRIA.',
  })
  @IsNotEmpty({ message: 'O tipo de movimentação é obrigatório.' })
  tipo: TipoMovimentacaoCaixa;

  // Valor retirado ou inserido em dinheiro (deve ser maior que zero)
  @IsNumber({}, { message: 'O valor deve ser numérico.' })
  @IsPositive({ message: 'O valor da movimentação deve ser maior que zero.' })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  valor: number;

  // Categoria ou motivo padronizado (ex: "Troco adicional", "Retirada para cofre", "Despesa rápida")
  @IsString({ message: 'A categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  categoria: string;

  // Detalhes complementares da operação - Opcional
  @IsString({ message: 'A observação deve ser um texto.' })
  @IsOptional()
  observacao?: string;
}
