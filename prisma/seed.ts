import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@gaspol.id" },
    update: {},
    create: {
      email: "admin@gaspol.id",
      password: hashedPassword,
      role: "admin",
    },
  })

  // Create vehicle categories
  const categories = [
    { name: "Motor", defaultKml: 35 },
    { name: "Mobil", defaultKml: 12 },
    { name: "Mini Bus", defaultKml: 10 },
    { name: "Bus Besar", defaultKml: 5 },
  ]

  for (const cat of categories) {
    await prisma.vehicleCategory.upsert({
      where: { name: cat.name },
      update: { defaultKml: cat.defaultKml },
      create: cat,
    })
  }

  // Get category IDs
  const motorCategory = await prisma.vehicleCategory.findUnique({
    where: { name: "Motor" },
  })
  const mobilCategory = await prisma.vehicleCategory.findUnique({
    where: { name: "Mobil" },
  })
  const miniBusCategory = await prisma.vehicleCategory.findUnique({
    where: { name: "Mini Bus" },
  })
  const busCategory = await prisma.vehicleCategory.findUnique({
    where: { name: "Bus Besar" },
  })

  // Create vehicle types
  const vehicleTypes = [
    { name: "Beat", kmPerLiter: 45, categoryId: motorCategory!.id },
    { name: "Scoopy", kmPerLiter: 42, categoryId: motorCategory!.id },
    { name: "Supra X 125", kmPerLiter: 40, categoryId: motorCategory!.id },
    { name: "Vario 125", kmPerLiter: 43, categoryId: motorCategory!.id },
    { name: "Avanza", kmPerLiter: 12, categoryId: mobilCategory!.id },
    { name: "Innova", kmPerLiter: 10, categoryId: mobilCategory!.id },
    { name: "Xenia", kmPerLiter: 13, categoryId: mobilCategory!.id },
    { name: "Calya", kmPerLiter: 15, categoryId: mobilCategory!.id },
    { name: "Hiace", kmPerLiter: 10, categoryId: miniBusCategory!.id },
    { name: "Elf", kmPerLiter: 9, categoryId: miniBusCategory!.id },
    { name: "Bus Medium", kmPerLiter: 6, categoryId: busCategory!.id },
    { name: "Bus Besar", kmPerLiter: 4, categoryId: busCategory!.id },
  ]

  for (const type of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { name: type.name },
      update: { kmPerLiter: type.kmPerLiter },
      create: type,
    })
  }

  // Create fuel providers
  const providers = ["Pertamina", "Shell", "BP"]

  for (const name of providers) {
    await prisma.fuelProvider.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Get provider IDs
  const pertamina = await prisma.fuelProvider.findUnique({
    where: { name: "Pertamina" },
  })
  const shell = await prisma.fuelProvider.findUnique({
    where: { name: "Shell" },
  })
  const bp = await prisma.fuelProvider.findUnique({ where: { name: "BP" } })

  // Create fuel prices
  const fuelPrices = [
    // Pertamina
    {
      providerId: pertamina!.id,
      fuelName: "Pertalite",
      fuelType: "RON 90",
      price: 10000,
    },
    {
      providerId: pertamina!.id,
      fuelName: "Pertamax",
      fuelType: "RON 92",
      price: 12950,
    },
    {
      providerId: pertamina!.id,
      fuelName: "Pertamax Turbo",
      fuelType: "RON 98",
      price: 14400,
    },
    {
      providerId: pertamina!.id,
      fuelName: "Dexlite",
      fuelType: "Diesel",
      price: 14550,
    },
    {
      providerId: pertamina!.id,
      fuelName: "Pertamina Dex",
      fuelType: "Diesel",
      price: 15200,
    },
    // Shell
    {
      providerId: shell!.id,
      fuelName: "Shell Super",
      fuelType: "RON 92",
      price: 13540,
    },
    {
      providerId: shell!.id,
      fuelName: "Shell V-Power",
      fuelType: "RON 95",
      price: 14090,
    },
    {
      providerId: shell!.id,
      fuelName: "Shell V-Power Nitro+",
      fuelType: "RON 98",
      price: 14980,
    },
    {
      providerId: shell!.id,
      fuelName: "Shell Diesel",
      fuelType: "Diesel",
      price: 17090,
    },
    // BP
    {
      providerId: bp!.id,
      fuelName: "BP 92",
      fuelType: "RON 92",
      price: 13500,
    },
    {
      providerId: bp!.id,
      fuelName: "BP Ultimate",
      fuelType: "RON 95",
      price: 14060,
    },
    {
      providerId: bp!.id,
      fuelName: "BP Ultimate Diesel",
      fuelType: "Diesel",
      price: 17040,
    },
  ]

  for (const fuel of fuelPrices) {
    await prisma.fuelPrice.upsert({
      where: {
        providerId_fuelName_fuelType: {
          providerId: fuel.providerId,
          fuelName: fuel.fuelName,
          fuelType: fuel.fuelType,
        },
      },
      update: { price: fuel.price },
      create: fuel,
    })
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
