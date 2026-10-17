import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class SangriaSuprimentoDto {
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsPositive({ message: 'O valor da movimentação deve ser maior que zero.' })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  valor: number;

  @IsString({ message: 'O motivo deve ser um texto.' })
  @IsNotEmpty({ message: 'O motivo/justificativa é obrigatório.' })
  motivo: string;

  @IsUUID('4', { message: 'O ID do funcionário deve ser um UUID válido.' })
  @IsOptional()
  funcionarioId?: string;
}
