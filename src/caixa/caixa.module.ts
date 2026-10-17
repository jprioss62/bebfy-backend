import { Module } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { CaixaController } from './caixa.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CaixaController],
  providers: [CaixaService],
  exports: [CaixaService], // Exportamos para que o VendasModule possa consultar o status do caixa antes de faturar
})
export class CaixaModule {}
