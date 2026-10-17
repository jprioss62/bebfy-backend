import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  async create(createFornecedorDto: CreateFornecedorDto) {
    const cnpjLimpo = this.normalizarCnpj(createFornecedorDto.cnpj);

    const fornecedorExiste = await this.prisma.fornecedor.findUnique({
      where: { cnpj: cnpjLimpo },
    });

    if (fornecedorExiste) {
      throw new ConflictException(
        `Já existe um fornecedor cadastrado com o CNPJ ${createFornecedorDto.cnpj}.`,
      );
    }

    return this.prisma.fornecedor.create({
      data: {
        ...createFornecedorDto,
        cnpj: cnpjLimpo,
      },
    });
  }

  async findAll(busca?: string) {
    if (busca) {
      const termo = busca.trim();
      return this.prisma.fornecedor.findMany({
        where: {
          OR: [
            { razaoSocial: { contains: termo, mode: 'insensitive' } },
            { nomeFantasia: { contains: termo, mode: 'insensitive' } },
            { cnpj: { contains: termo.replace(/\D/g, '') } },
          ],
        },
        orderBy: { razaoSocial: 'asc' },
      });
    }

    return this.prisma.fornecedor.findMany({
      orderBy: { razaoSocial: 'asc' },
    });
  }

  async findOne(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
      include: {
        notasFiscais: {
          orderBy: { dataEmissao: 'desc' },
        },
      },
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }

    return fornecedor;
  }

  async update(id: string, updateFornecedorDto: UpdateFornecedorDto) {
    await this.findOne(id);

    const dadosAtualizacao: any = { ...updateFornecedorDto };

    if (updateFornecedorDto.cnpj) {
      const cnpjLimpo = this.normalizarCnpj(updateFornecedorDto.cnpj);

      const outroFornecedor = await this.prisma.fornecedor.findUnique({
        where: { cnpj: cnpjLimpo },
      });

      if (outroFornecedor && outroFornecedor.id !== id) {
        throw new ConflictException(
          'Já existe outro fornecedor cadastrado com este CNPJ.',
        );
      }

      dadosAtualizacao.cnpj = cnpjLimpo;
    }

    return this.prisma.fornecedor.update({
      where: { id },
      data: dadosAtualizacao,
    });
  }

  async remove(id: string) {
    const fornecedor = await this.findOne(id);

    if (fornecedor.notasFiscais && fornecedor.notasFiscais.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir este fornecedor pois existem notas fiscais vinculadas a ele.',
      );
    }

    return this.prisma.fornecedor.delete({
      where: { id },
    });
  }
}
