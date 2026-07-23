import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Create clients
  const pke = await prisma.client.create({
    data: {
      name: "PKE",
      contractStart: new Date("2026-01-01"),
      contractEnd: new Date("2026-12-31"),
      isActive: true,
    },
  });

  const izakayaTago = await prisma.client.create({
    data: {
      name: "Izakaya Tago",
      contractStart: new Date("2026-06-01"),
      contractEnd: new Date("2026-12-01"),
      isActive: true,
    },
  });

  const amalgatedProperties = await prisma.client.create({
    data: {
      name: "Amalgated Properties",
      contractStart: new Date("2026-03-01"),
      contractEnd: new Date("2027-03-01"),
      isActive: true,
    },
  });

  console.log("Created 3 clients");

  // 2. Create July 2026 DeliverablePlans
  await prisma.deliverablePlan.create({
    data: {
      clientId: pke.id,
      periodMonth: 7,
      periodYear: 2026,
      graphicsQuota: 6,
      photoQuota: 20,
      reelsQuota: 6,
    },
  });

  await prisma.deliverablePlan.create({
    data: {
      clientId: izakayaTago.id,
      periodMonth: 7,
      periodYear: 2026,
      graphicsQuota: 5,
      photoQuota: 20,
      reelsQuota: 1,
    },
  });

  await prisma.deliverablePlan.create({
    data: {
      clientId: amalgatedProperties.id,
      periodMonth: 7,
      periodYear: 2026,
      graphicsQuota: 8,
      photoQuota: 15,
      reelsQuota: 15,
    },
  });

  console.log("Created 3 deliverable plans");

  // 3. Create team members
  const yuhan = await prisma.teamMember.create({
    data: { name: "Yuhan", role: "Editor", isActive: true },
  });

  const kent = await prisma.teamMember.create({
    data: { name: "Kent", role: "Editor", isActive: true },
  });

  console.log("Created 2 team members");

  // 4. Create a couple of sample tasks (pulled from real PKE data)
  await prisma.task.create({
    data: {
      title: "Reel #1.2 Artson Interview",
      clientId: pke.id,
      assignedToId: yuhan.id,
      contentType: "REEL",
      platforms: "FB",
      quantity: 1,
      status: "PUBLISHED",
      deadline: new Date("2026-06-25"),
      actualPublishDate: new Date("2026-06-25"),
      publishedPostLink: "https://www.facebook.com/share/r/1DzbJpPKH2/",
    },
  });

  await prisma.task.create({
    data: {
      title: "Graphics #1.5: Egg Mixer",
      clientId: pke.id,
      assignedToId: yuhan.id,
      contentType: "GRAPHIC",
      platforms: "IG,FB",
      quantity: 1,
      status: "CLIENT_REVIEW",
      reviewRound: 1,
      deadline: new Date("2026-06-08"),
    },
  });

  console.log("Created 2 sample tasks");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });