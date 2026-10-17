// Importamos os decoradores e exceções padrão do NestJS
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Importamos o PrismaService para manipular a tabela Funcionario no PostgreSQL
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionariosService {
  // Injeta o cliente do Prisma no construtor
  constructor(private readonly prisma: PrismaService) {}

  // Cria um novo colaborador e valida a unicidade do CPF
  async create(createFuncionarioDto: CreateFuncionarioDto) {
    // 1. Verifica se já existe um funcionário com este CPF
    const funcionarioExistente = await this.prisma.funcionario.findUnique({
      where: { cpf: createFuncionarioDto.cpf },
    });

    if (funcionarioExistente) {
      throw new BadRequestException(
        'Já existe um funcionário cadastrado com este CPF.',
      );
    }

    // 2. Cria o funcionário no banco de dados
    return this.prisma.funcionario.create({
      data: createFuncionarioDto,
    });
  }

  // Lista todos os funcionários da distribuidora (ativos e inativos)
  async findAll() {
    return this.prisma.funcionario.findMany({
      include: {
        // Inclui a conta de login associada (se já possuir usuário cadastrado)
        usuario: {
          select: {
            id: true,
            email: true,
            permissoes: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  // Busca um funcionário específico pelo ID com detalhes de histórico
  async findOne(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            permissoes: true,
          },
        },
        // Traz os últimos caixas que este funcionário fechou como operador
        caixasFechados: {
          orderBy: { abertoEm: 'desc' },
          take: 5,
        },
      },
    });

    // Se não encontrar o colaborador, lança erro 404
    if (!funcionario) {
      throw new NotFoundException(
        `Funcionário com ID ${id} não foi encontrado.`,
      );
    }

    return funcionario;
  }

  // Atualiza os dados de um colaborador existente
  async update(id: string, updateFuncionarioDto: UpdateFuncionarioDto) {
    // Garante que o funcionário existe antes de atualizar
    await this.findOne(id);

    // Se estiver a alterar o CPF, garante que o novo CPF não pertence a outro funcionário
    if (updateFuncionarioDto.cpf) {
      const funcionarioExistente = await this.prisma.funcionario.findUnique({
        where: { cpf: updateFuncionarioDto.cpf },
      });

      if (funcionarioExistente && funcionarioExistente.id !== id) {
        throw new BadRequestException(
          'Este CPF já se encontra cadastrado para outro funcionário.',
        );
      }
    }

    return this.prisma.funcionario.update({
      where: { id },
      data: updateFuncionarioDto,
    });
  }

  // Remove um funcionário da base de dados
  async remove(id: string) {
    // Confirma que o funcionário existe
    await this.findOne(id);

    return this.prisma.funcionario.delete({
      where: { id },
    });
  }
}
