"use server"

import { prisma } from "@/lib/prisma"

export interface FuelPriceData {
  provider: string
  fuelName: string
  fuelType: string
  price: number
}

export async function saveFuelPrices(prices: FuelPriceData[]) {
  console.log(`\n💾 Saving ${prices.length} prices...\n`)

  for (const fuel of prices) {
    const provider = await prisma.fuelProvider.upsert({
      where: { name: fuel.provider },
      update: {},
      create: { name: fuel.provider },
    })

    await prisma.fuelPrice.upsert({
      where: {
        providerId_fuelName_fuelType: {
          providerId: provider.id,
          fuelName: fuel.fuelName,
          fuelType: fuel.fuelType,
        },
      },
      update: { price: fuel.price },
      create: {
        providerId: provider.id,
        fuelName: fuel.fuelName,
        fuelType: fuel.fuelType,
        price: fuel.price,
      },
    })

    console.log(`✅ Updated ${fuel.provider} - ${fuel.fuelName}: Rp ${fuel.price}`)
  }
}

export async function writeScrapingLog(
  provider: string,
  status: "SUCCESS" | "FAILED",
  message?: string
) {
  try {
    await prisma.scrapingLog.create({
      data: {
        provider,
        status,
        message,
      },
    })
  } catch (e) {
    console.error("❌ Failed to write scraping log:", e)
  }
}
