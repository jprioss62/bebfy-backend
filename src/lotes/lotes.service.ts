import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLoteDto: CreateLoteDto) {
    const produto = await this.prisma.produto.findUnique({
      where: { id: createLoteDto.produtoId },
    });

    if (!produto) {
      throw new NotFoundException('Produto informado não foi encontrado.');
    }

    return this.prisma.$transaction(async (tx) => {
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

      await tx.produto.update({
        where: { id: createLoteDto.produtoId },
        data: {
          estoqueAtual: {
            increment: createLoteDto.quantidade,
          },
        },
      });

      return lote;
    });
  }

  async findAll() {
    return this.prisma.loteProduto.findMany({
      include: {
        produto: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: number) {
    const lote = await this.prisma.loteProduto.findUnique({
      where: { id },
      include: {
        produto: true,
      },
    });

    if (!lote) {
      throw new NotFoundException(`Lote com ID ${id} não foi encontrado.`);
    }

    return lote;
  }

  async update(id: number, updateLoteDto: UpdateLoteDto) {
    await this.findOne(id);

    return this.prisma.loteProduto.update({
      where: { id },
      data: {
        ...updateLoteDto,
        dataVencimento: updateLoteDto.dataVencimento
          ? new Date(updateLoteDto.dataVencimento)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    const lote = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.produto.update({
        where: { id: lote.produtoId },
        data: {
          estoqueAtual: {
            decrement: lote.quantidade,
          },
        },
      });

      return tx.loteProduto.delete({
        where: { id },
      });
    });
  }
}
