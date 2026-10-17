// Importamos os validadores do class-validator para garantir dados válidos
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
// Importamos o enum oficial gerado pelo Prisma para o tipo de transação
import { TipoTransacaoFiado } from '@prisma/client';

export class CreateFiadoDto {
  // ID do cliente (UUID da tabela Cliente) que terá a dívida alterada - Obrigatório
  @IsString({ message: 'O ID do cliente deve ser um texto/UUID válido.' })
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório.' })
  clienteId: string;

  // Tipo da movimentação: DEBITO (aumenta dívida) ou CREDITO (pagamento/abate) - Obrigatório
  @IsEnum(TipoTransacaoFiado, {
    message: 'O tipo de transação deve ser DEBITO ou CREDITO.',
  })
  @IsNotEmpty({ message: 'O tipo da transação é obrigatório.' })
  tipo: TipoTransacaoFiado;

  // Valor da movimentação em reais (deve ser estritamente maior que 0) - Obrigatório
  @IsNumber({}, { message: 'O valor deve ser numérico.' })
  @IsPositive({ message: 'O valor da transação deve ser maior que zero.' })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  valor: number;

  // Motivo ou observação da operação (ex: "Pagamento parcial via PIX", "Compra balcão") - Opcional
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsOptional()
  descricao?: string;

  // ID da venda vinculada caso o fiado tenha sido originado no PDV - Opcional
  @IsString({ message: 'O ID da venda deve ser um texto/UUID válido.' })
  @IsOptional()
  vendaId?: string;
}
