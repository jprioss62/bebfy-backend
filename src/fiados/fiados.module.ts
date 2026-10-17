import { Module } from '@nestjs/common';
import { FiadosService } from './fiados.service';
import { FiadosController } from './fiados.controller';
// Importamos o PrismaModule para acesso ao banco de dados
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FiadosController],
  providers: [FiadosService],
  exports: [FiadosService], // Exporta o serviço para ser consumido pelo módulo de Vendas/PDV
})
export class FiadosModule {}
