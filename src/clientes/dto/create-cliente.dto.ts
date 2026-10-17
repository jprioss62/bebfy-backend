// Importamos os validadores do class-validator para garantir a integridade dos dados cadastrais
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateClienteDto {
  // Nome completo ou Razão Social do cliente - Campo Obrigatório
  @IsString({ message: 'O nome do cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório.' })
  nome: string;

  // CPF ou CNPJ único para emissão de vendas e controle de fiado - Opcional
  @IsString({ message: 'O CPF ou CNPJ deve ser um texto.' })
  @IsOptional()
  cpfCnpj?: string;

  // Telefone ou WhatsApp de contato para avisos e cobranças - Opcional
  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsOptional()
  telefone?: string;

  // Endereço completo para entregas delivery - Opcional
  @IsString({ message: 'O endereço deve ser um texto.' })
  @IsOptional()
  endereco?: string;

  // Limite máximo permitido para compras a prazo/fiado (padrão 0.00) - Opcional
  @IsNumber({}, { message: 'O limite de crédito deve ser um valor numérico.' })
  @Min(0, { message: 'O limite de crédito não pode ser um valor negativo.' })
  @IsOptional()
  limiteCredito?: number;

  // Quantidade de garrafas/cascos retornáveis atualmente sob posse do cliente - Opcional
  @IsInt({ message: 'A quantidade de cascos deve ser um número inteiro.' })
  @Min(0, { message: 'A quantidade de cascos não pode ser negativa.' })
  @IsOptional()
  cascosEmPosse?: number;
}
