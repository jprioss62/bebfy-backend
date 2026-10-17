// Importamos os decoradores e exceções padrão do NestJS
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Importamos o PrismaService para acesso às tabelas do PostgreSQL
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  // Injeta o cliente do Prisma no construtor
  constructor(private readonly prisma: PrismaService) {}

  // Cria um novo cliente no banco e valida se o CPF/CNPJ já não existe
  async create(createClienteDto: CreateClienteDto) {
    // Se foi fornecido um CPF/CNPJ, valida se já está cadastrado
    if (createClienteDto.cpfCnpj) {
      const clienteExistente = await this.prisma.cliente.findUnique({
        where: { cpfCnpj: createClienteDto.cpfCnpj },
      });

      if (clienteExistente) {
        throw new BadRequestException(
          'Já existe um cliente cadastrado com este CPF/CNPJ.',
        );
      }
    }

    // Cria o registro na tabela Cliente
    return this.prisma.cliente.create({
      data: createClienteDto,
    });
  }

  // Lista todos os clientes cadastrados em ordem alfabética
  async findAll() {
    return this.prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  // Busca um cliente específico pelo ID trazendo histórico de fiados e últimas vendas
  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        // Traz as últimas 10 movimentações de fiado deste cliente
        fiados: {
          orderBy: { criadoEm: 'desc' },
          take: 10,
        },
        // Traz as últimas 5 compras realizadas por ele
        vendas: {
          orderBy: { criadoEm: 'desc' },
          take: 5,
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com o ID ${id} não foi encontrado.`);
    }

    return cliente;
  }

  // Atualiza as informações de um cliente existente
  async update(id: string, updateClienteDto: UpdateClienteDto) {
    // Confirma que o cliente existe antes de alterar
    await this.findOne(id);

    // Se estiver atualizando o CPF/CNPJ, garante que não pertence a outro cliente
    if (updateClienteDto.cpfCnpj) {
      const clienteExistente = await this.prisma.cliente.findUnique({
        where: { cpfCnpj: updateClienteDto.cpfCnpj },
      });

      if (clienteExistente && clienteExistente.id !== id) {
        throw new BadRequestException(
          'Este CPF/CNPJ já está cadastrado para outro cliente.',
        );
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  // Remove um cliente do sistema
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.cliente.delete({
      where: { id },
    });
  }
}
