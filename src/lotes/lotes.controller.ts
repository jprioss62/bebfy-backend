// Importamos os decoradores HTTP do NestJS e a proteção por Guard
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
// Importamos o serviço responsável pelas regras de negócio dos lotes
import { LotesService } from './lotes.service';
// Importamos o DTO de validação
import { CreateLoteDto } from './dto/create-lote.dto';
// Importamos o Guard para garantir autenticação JWT nas rotas
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Aplica a exigência do Token JWT em todas as rotas do endpoint /lotes
@UseGuards(JwtAuthGuard)
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  // Endpoint POST /lotes -> Recebe os dados, valida o DTO e cria um novo lote
  @Post()
  create(@Body() createLoteDto: CreateLoteDto) {
    return this.lotesService.create(createLoteDto);
  }

  // Endpoint GET /lotes -> Lista todos os lotes cadastrados
  @Get()
  findAll() {
    return this.lotesService.findAll();
  }

  // Endpoint GET /lotes/:id -> Retorna o lote específico do ID informado
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }

  // Endpoint DELETE /lotes/:id -> Remove o lote e abate do estoque do produto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lotesService.remove(id);
  }
}
