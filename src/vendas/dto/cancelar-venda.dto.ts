import { IsOptional, IsString } from 'class-validator';

export class CancelarVendaDto {
  @IsString({ message: 'O motivo do cancelamento deve ser um texto.' })
  @IsOptional()
  motivo?: string;
}
