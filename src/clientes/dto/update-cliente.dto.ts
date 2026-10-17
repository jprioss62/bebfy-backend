// Importamos o PartialType para tornar todos os campos do CreateClienteDto opcionais na edição
import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
