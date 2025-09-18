import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { id: uuidv4(), name: "Alice Johnson", email: "alice@example.com" },
      { id: uuidv4(), name: "Bob Smith", email: "bob@example.com" },
      { id: uuidv4(), name: "Charlie Brown", email: "charlie@example.com" },
      { id: uuidv4(), name: "Diana Prince", email: "diana@example.com" },
      { id: uuidv4(), name: "Ethan Hunt", email: "ethan@example.com" }
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log("🌱 Database seeded successfully"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
