// Importamos os validadores do class-validator para verificar os dados do colaborador
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
// Importamos o enum Cargo diretamente do Prisma Client
import { Cargo } from '@prisma/client';

export class CreateFuncionarioDto {
  // Nome completo do colaborador - Campo Obrigatório
  @IsString({ message: 'O nome do funcionário deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do funcionário é obrigatório.' })
  nome: string;

  // CPF do funcionário (único no sistema para identificação e folha) - Campo Obrigatório
  @IsString({ message: 'O CPF deve ser um texto.' })
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf: string;

  // Telefone ou WhatsApp para contacto direto - Opcional
  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsOptional()
  telefone?: string;

  // Cargo atribuído ao funcionário dentro da distribuidora - Campo Obrigatório
  @IsEnum(Cargo, {
    message:
      'Cargo inválido. Opções permitidas: ADMINISTRADOR, FUNCIONARIO, PROPRIETARIO, GERENTE, OPERADOR_CAIXA, ESTOQUISTA, ENTREGADOR.',
  })
  @IsNotEmpty({ message: 'O cargo é obrigatório.' })
  cargo: Cargo;

  // Percentual ou valor máximo de desconto que este funcionário tem permissão para conceder nas vendas (padrão 0.00) - Opcional
  @IsNumber({}, { message: 'O desconto máximo deve ser um valor numérico.' })
  @Min(0, { message: 'O desconto máximo não pode ser um valor negativo.' })
  @IsOptional()
  descontoMaximo?: number;

  // Define se o funcionário está ativo na empresa para operar no sistema (padrão true) - Opcional
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  @IsOptional()
  ativo?: boolean;
}
