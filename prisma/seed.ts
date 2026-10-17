import { PrismaClient, Cargo } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@bebfy.com';
  const senhaPlana = '123456';
  // Gera o hash compatível com o AuthModule
  const senhaHash = await bcrypt.hash(senhaPlana, 10);

  console.log('🌱 Executando seed do banco de dados...');

  // 1. Cria ou localiza o funcionário Administrador
  const funcionario = await prisma.funcionario.upsert({
    where: { cpf: '00000000000' },
    update: {},
    create: {
      nome: 'Administrador Geral',
      cpf: '00000000000',
      telefone: '62999999999',
      cargo: Cargo.ADMINISTRADOR,
      descontoMaximo: 100.0,
      ativo: true,
    },
  });

  // 2. Cria ou atualiza o usuário vinculado a esse funcionário
  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {
      senha: senhaHash,
    },
    create: {
      email,
      senha: senhaHash,
      funcionarioId: funcionario.id,
      permissoes: ['ADMIN', 'TOTAL'],
    },
  });

  console.log(`Usuário administrador configurado: ${usuario.email}`);
  console.log(`Funcionário ID: ${funcionario.id}`);
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
