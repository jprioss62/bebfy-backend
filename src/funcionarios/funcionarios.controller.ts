// Importamos os decoradores HTTP do NestJS e a proteção por Guard
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
import { FuncionariosService } from './funcionarios.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Exige que todas as rotas do endpoint /funcionarios estejam autenticadas via JWT
@UseGuards(JwtAuthGuard)
@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  // POST /funcionarios -> Cadastra um novo colaborador
  @Post()
  create(@Body() createFuncionarioDto: CreateFuncionarioDto) {
    return this.funcionariosService.create(createFuncionarioDto);
  }

  // GET /funcionarios -> Lista todos os colaboradores
  @Get()
  findAll() {
    return this.funcionariosService.findAll();
  }

  // GET /funcionarios/:id -> Retorna o colaborador com seus vínculos
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funcionariosService.findOne(id);
  }

  // PATCH /funcionarios/:id -> Atualiza dados do colaborador (cargo, desconto, telefone, etc.)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFuncionarioDto: UpdateFuncionarioDto,
  ) {
    return this.funcionariosService.update(id, updateFuncionarioDto);
  }

  // DELETE /funcionarios/:id -> Remove o colaborador
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.funcionariosService.remove(id);
  }
}
