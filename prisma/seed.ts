import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.trainer.upsert({
    where: { email: "admin@volley.local" },
    create: {
      name: "Alex Admin",
      email: "admin@volley.local",
      role: Role.admin,
      ratePerHour: 35,
      iban: "DE12345678901234567890"
    },
    update: {}
  });

  await prisma.team.upsert({
    where: { name: "Volleys Herren" },
    create: {
      name: "Volleys Herren",
      league: "Bezirksliga",
      isYouth: false
    },
    update: {}
  });

  await prisma.team.upsert({
    where: { name: "Volleys U18" },
    create: {
      name: "Volleys U18",
      league: "Jugend Oberliga",
      isYouth: true
    },
    update: {}
  });

  console.log(`Seed completed for admin ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
