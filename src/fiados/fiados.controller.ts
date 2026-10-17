// Importamos os decoradores do NestJS e a proteção JWT
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FiadosService } from './fiados.service';
import { CreateFiadoDto } from './dto/create-fiado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Protege todos os endpoints com autenticação via Token JWT
@UseGuards(JwtAuthGuard)
@Controller('fiados')
export class FiadosController {
  constructor(private readonly fiadosService: FiadosService) {}

  // POST /fiados -> Lança uma nova movimentação (DÉBITO ou CRÉDITO)
  @Post()
  create(@Body() createFiadoDto: CreateFiadoDto) {
    return this.fiadosService.create(createFiadoDto);
  }

  // GET /fiados -> Retorna todos os lançamentos de fiado da distribuidora
  @Get()
  findAll() {
    return this.fiadosService.findAll();
  }

  // GET /fiados/cliente/:clienteId -> Retorna o extrato detalhado do fiado do cliente
  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId') clienteId: string) {
    return this.fiadosService.findByCliente(clienteId);
  }

  // GET /fiados/:id -> Consulta um lançamento específico
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiadosService.findOne(id);
  }

  // DELETE /fiados/:id -> Estorna um lançamento de fiado corrigindo o saldo do cliente
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiadosService.remove(id);
  }
}
