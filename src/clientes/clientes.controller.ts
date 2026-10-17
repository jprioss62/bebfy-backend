// Importamos os decoradores HTTP do NestJS e o Guard de proteção JWT
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Exige que todas as rotas de clientes tenham token de autenticação JWT válido
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // POST /clientes -> Cria um novo cliente
  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  // GET /clientes -> Lista todos os clientes
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // GET /clientes/:id -> Retorna o cliente com histórico de compras e fiados
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  // PATCH /clientes/:id -> Atualiza dados cadastrais
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  // DELETE /clientes/:id -> Remove o cliente
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
