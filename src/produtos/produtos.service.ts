import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProdutoDto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: createProdutoDto,
    });
  }

  async findAll() {
    return this.prisma.produto.findMany({
      include: {
        categoria: true,
        lotes: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        lotes: true,
      },
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não foi encontrado.`);
    }

    return produto;
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto) {
    await this.findOne(id);

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
