import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
// Importamos o PrismaModule para disponibilizar o PrismaService
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Fornece a conexão com o banco de dados PostgreSQL
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Exportado para que os módulos de Vendas e Fiado possam usá-lo
})
export class ClientesModule {}
