// Importamos os decoradores e exceções padrão do NestJS
import { Injectable, NotFoundException } from '@nestjs/common';
// Importamos o serviço do Prisma para realizar as consultas no PostgreSQL
import { PrismaService } from '../prisma/prisma.service';
// Importamos o DTO de criação do lote
import { CreateLoteDto } from './dto/create-lote.dto';

@Injectable()
export class LotesService {
  // Injeta o PrismaService para ter acesso ao modelo LoteProduto e Produto
  constructor(private readonly prisma: PrismaService) {}

  // Registra um novo lote e incrementa automaticamente a quantidade no estoque do produto
  async create(createLoteDto: CreateLoteDto) {
    // 1. Verifica se o produto informado existe no banco de dados
    const produto = await this.prisma.produto.findUnique({
      where: { id: createLoteDto.produtoId },
    });

    // Se o produto não for encontrado, lança a exceção HTTP 404
    if (!produto) {
      throw new NotFoundException(
        'O produto informado para este lote não foi encontrado.',
      );
    }

    // 2. Executa uma transação atômica no Prisma:
    // Cria o registro do lote E atualiza o saldo do produto de forma segura na mesma operação.
    return this.prisma.$transaction(async (tx) => {
      // Registra a entrada do lote na tabela LoteProduto
      const lote = await tx.loteProduto.create({
        data: {
          produtoId: createLoteDto.produtoId,
          quantidade: createLoteDto.quantidade,
          numeroLote: createLoteDto.numeroLote,
          dataVencimento: createLoteDto.dataVencimento
            ? new Date(createLoteDto.dataVencimento)
            : null,
        },
      });

      // Incrementa a quantidade inserida diretamente no campo estoqueAtual do produto
      await tx.produto.update({
        where: { id: createLoteDto.produtoId },
        data: {
          estoqueAtual: {
            increment: createLoteDto.quantidade,
          },
        },
      });

      // Retorna o lote criado com sucesso
      return lote;
    });
  }

  // Busca e retorna todos os lotes cadastrados, incluindo os dados completos do produto
  async findAll() {
    return this.prisma.loteProduto.findMany({
      include: {
        produto: true, // Inclui o objeto completo do produto vinculado
      },
      orderBy: {
        criadoEm: 'desc', // Ordena dos lotes mais recentes aos mais antigos
      },
    });
  }

  // Busca um lote específico pelo seu ID (UUID)
  async findOne(id: string) {
    const lote = await this.prisma.loteProduto.findUnique({
      where: { id },
      include: {
        produto: true, // Inclui as informações do produto vinculado
      },
    });

    // Se o lote não for encontrado, lança erro 404
    if (!lote) {
      throw new NotFoundException('Lote com o ID ${id} não foi encontrado.');
    }

    return lote;
  }

  // Remove um lote e decrementa (abate) a quantidade do lote no estoque do produto
  async remove(id: string) {
    // Garante que o lote existe antes de tentar deletar
    const lote = await this.findOne(id);

    // Executa o abatimento e a exclusão em uma transação no banco de dados
    return this.prisma.$transaction(async (tx) => {
      // Subtrai do produto a quantidade que havia sido inserida por este lote
      await tx.produto.update({
        where: { id: lote.produtoId },
        data: {
          estoqueAtual: {
            decrement: lote.quantidade,
          },
        },
      });

      // Deleta o registro do lote na tabela LoteProduto
      return tx.loteProduto.delete({
        where: { id },
      });
    });
  }
}
