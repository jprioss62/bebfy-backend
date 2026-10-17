// Importamos o PartialType para herdar os campos do DTO de criação
import { PartialType } from '@nestjs/mapped-types';
import { CreateFiadoDto } from './create-fiado.dto';

// Permite atualização de campos auxiliares como descrição
export class UpdateFiadoDto extends PartialType(CreateFiadoDto) {}
