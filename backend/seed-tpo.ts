import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'paldhaduk18@gmail.com';
  const password = '123456';
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const tpoUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.TPO,
    },
    create: {
      email,
      password: hashedPassword,
      role: Role.TPO,
    },
  });

  console.log('TPO User seeded/updated:', tpoUser.email, 'Role:', tpoUser.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
