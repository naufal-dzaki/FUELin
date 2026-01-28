"use server"

import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import type { FuelProviderWithPrices } from "@/lib/types"

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

export async function getFuelProviders(): Promise<FuelProviderWithPrices[]> {
  try {
    const providers = await prisma.fuelProvider.findMany({
      include: {
        fuelPrices: {
          select: {
            id: true,
            fuelName: true,
            fuelType: true,
            price: true,
            updatedAt: true,
          },
          orderBy: { fuelName: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })
    return providers
  } catch (error) {
    console.error("Error fetching fuel providers:", error)
    return []
  }
}

export async function getFuelPrice(id: number) {
  try {
    return await prisma.fuelPrice.findUnique({
      where: { id },
      include: { provider: true },
    })
  } catch (error) {
    console.error("Error fetching fuel price:", error)
    return null
  }
}

export async function createFuelProvider(name: string) {
  try {
    const provider = await prisma.fuelProvider.create({
      data: { name },
    })
    revalidateTag("fuel", "max")
    return { success: true, data: provider }
  } catch (error) {
    console.error("Error creating fuel provider:", error)
    return { success: false, error: "Failed to create provider" }
  }
}

export async function updateFuelProvider(id: number, name: string) {
  try {
    const provider = await prisma.fuelProvider.update({
      where: { id },
      data: { name },
    })
    revalidateTag("fuel", "max")
    return { success: true, data: provider }
  } catch (error) {
    console.error("Error updating fuel provider:", error)
    return { success: false, error: "Failed to update provider" }
  }
}

export async function deleteFuelProvider(id: number) {
  try {
    await prisma.fuelProvider.delete({ where: { id } })
    revalidateTag("fuel", "max")
    return { success: true }
  } catch (error) {
    console.error("Error deleting fuel provider:", error)
    return { success: false, error: "Failed to delete provider" }
  }
}

export async function createFuelPrice(
  providerId: number,
  fuelName: string,
  fuelType: string,
  price: number
) {
  try {
    const fuelPrice = await prisma.fuelPrice.create({
      data: { providerId, fuelName, fuelType, price },
    })
    revalidateTag("fuel", "max")
    return { success: true, data: fuelPrice }
  } catch (error) {
    console.error("Error creating fuel price:", error)
    return { success: false, error: "Failed to create fuel price" }
  }
}

export async function updateFuelPrice(
  id: number,
  fuelName: string,
  fuelType: string,
  price: number
) {
  try {
    const fuelPrice = await prisma.fuelPrice.update({
      where: { id },
      data: { fuelName, fuelType, price },
    })
    revalidateTag("fuel", "max")
    return { success: true, data: fuelPrice }
  } catch (error) {
    console.error("Error updating fuel price:", error)
    return { success: false, error: "Failed to update fuel price" }
  }
}

export async function deleteFuelPrice(id: number) {
  try {
    await prisma.fuelPrice.delete({ where: { id } })
    revalidateTag("fuel", "max")
    return { success: true }
  } catch (error) {
    console.error("Error deleting fuel price:", error)
    return { success: false, error: "Failed to delete fuel price" }
  }
}

export async function getScrapingLogs() {
  try {
    return await prisma.scrapingLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    })
  } catch (error) {
    console.error("Error fetching scraping logs:", error)
    return []
  }
}
