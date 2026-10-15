// Importamos os decoradores e exceções padrão do NestJS
import { Injectable, NotFoundException } from '@nestjs/common';
// Importamos os DTOs de criação e atualização de produtos
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
// Importamos o serviço global do Prisma para acesso ao banco de dados PostgreSQL
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProdutosService {
  // Injeta a instância do PrismaService no construtor para executar as queries na tabela Produto
  constructor(private readonly prisma: PrismaService) {}

  // Cria um novo registo de produto no banco de dados
  async create(createProdutoDto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: createProdutoDto,
    });
  }

  // Procura e retorna todos os produtos cadastrados
  // Traz junto os dados da Categoria vinculada e a lista de Lotes do produto
  async findAll() {
    return this.prisma.produto.findMany({
      include: {
        categoria: true, // Inclui o objeto completo da categoria associada
        lotes: true, // Inclui os lotes vinculados a este produto
      },
      orderBy: {
        criadoEm: 'desc', // Ordena do produto mais recente para o mais antigo
      },
    });
  }

  // Procura um único produto através do seu ID (UUID)
  async findOne(id: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true, // Traz os dados da categoria vinculada
        lotes: true, // Traz os lotes vinculados ao produto
      },
    });

    // Se o ID informado não existir na base de dados, lança a exceção HTTP 404 (Not Found)
    if (!produto) {
      throw new NotFoundException('Produto com o ID ${id} não foi encontrado.');
    }

    return produto;
  }

  // Atualiza as informações de um produto existente pelo ID
  async update(id: string, updateProdutoDto: UpdateProdutoDto) {
    // Garante que o produto existe na base de dados antes de efetuar a alteração
    await this.findOne(id);

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto,
    });
  }

  // Remove um produto da base de dados pelo ID
  async remove(id: string) {
    // Garante que o produto existe antes de tentar eliminar
    await this.findOne(id);

    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
