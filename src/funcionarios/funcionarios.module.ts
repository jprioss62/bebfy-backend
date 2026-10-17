import { Module } from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { FuncionariosController } from './funcionarios.controller';
// Importamos o PrismaModule para acesso à base de dados
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FuncionariosController],
  providers: [FuncionariosService],
  exports: [FuncionariosService], // Exportamos para que o CaixaModule e o VendasModule possam injetar se necessário
})
export class FuncionariosModule {}
