// Importamos o PartialType para tornar todos os campos do CreateFuncionarioDto opcionais na edição
import { PartialType } from '@nestjs/mapped-types';
import { CreateFuncionarioDto } from './create-funcionario.dto';

export class UpdateFuncionarioDto extends PartialType(CreateFuncionarioDto) {}
