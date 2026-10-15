// Importamos os validadores do class-validator para validar os dados recebidos na API
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLoteDto {
  // ID do produto ao qual este lote pertence (UUID que faz a relação com a tabela Produto) - Obrigatório
  @IsString({ message: 'O ID do produto deve ser um texto/UUID válido.' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
  produtoId: string;

  // Quantidade de unidades deste lote adicionadas ao estoque - Obrigatório
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'A quantidade do lote é obrigatória.' })
  quantidade: number;

  // Código ou número do lote informado pelo fornecedor/fabricante (ex: "LOTE-2026-X") - Opcional
  @IsString({ message: 'O número do lote deve ser um texto.' })
  @IsOptional()
  numeroLote?: string;

  // Data de vencimento/validade do lote no formato ISO "AAAA-MM-DD" - Opcional
  @IsDateString(
    {},
    {
      message:
        'A data de vencimento deve ser uma data válida no formato YYYY-MM-DD.',
    },
  )
  @IsOptional()
  dataVencimento?: string;
}
