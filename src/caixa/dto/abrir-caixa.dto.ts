// Importamos os validadores do class-validator para garantir a consistência na abertura do caixa
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AbrirCaixaDto {
  // ID do funcionário operador que está a assumir este caixa - Campo Obrigatório
  @IsString({ message: 'O ID do operador deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O ID do operador é obrigatório.' })
  operadorId: string;

  // Valor em dinheiro colocado na gaveta como fundo de troco inicial - Campo Obrigatório
  @IsNumber({}, { message: 'O saldo inicial deve ser um valor numérico.' })
  @Min(0, { message: 'O saldo inicial não pode ser negativo.' })
  @IsNotEmpty({ message: 'O saldo inicial é obrigatório.' })
  saldoInicial: number;
}
