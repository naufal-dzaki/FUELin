"use server"

import { prisma } from "@/lib/prisma"
import { getCoordinates } from "./location"
import { calculateRoute } from "./routing"
import { getRouteProfile } from "@/lib/route-profile"
import type { EstimateInput, EstimateResult } from "@/lib/types"

export async function calculateEstimate(input: EstimateInput): Promise<{
  success: boolean
  data?: EstimateResult
  error?: string
}> {
  try {
    const [startCoords, endCoords] = await Promise.all([
      getCoordinates(input.startLocationName),
      getCoordinates(input.endLocationName),
    ])

    if (!startCoords) {
      return { success: false, error: "Could not find starting location coordinates" }
    }

    if (!endCoords) {
      return { success: false, error: "Could not find destination coordinates" }
    }

    const category = await prisma.vehicleCategory.findUnique({
      where: { id: input.vehicleCategoryId },
    })

    if (!category) {
      return { success: false, error: "Vehicle category not found" }
    }

    let kmPerLiter = category.defaultKml
    let vehicleName = category.name

    if (input.vehicleTypeId) {
      const vehicleType = await prisma.vehicleType.findUnique({
        where: { id: input.vehicleTypeId },
      })
      if (vehicleType) {
        kmPerLiter = vehicleType.kmPerLiter
        vehicleName = `${vehicleType.name} (${category.name})`
      }
    }

    const fuelPrice = await prisma.fuelPrice.findUnique({
      where: { id: input.fuelPriceId },
      include: { provider: true },
    })

    if (!fuelPrice) {
      return { success: false, error: "Fuel price not found" }
    }

    const profile = getRouteProfile(category.name)
    const route = await calculateRoute(
      startCoords.lat,
      startCoords.lon,
      endCoords.lat,
      endCoords.lon,
      profile
    )

    if (!route) {
      return { success: false, error: "Could not calculate route between locations" }
    }

    const litersUsed = route.distanceKm / kmPerLiter
    const totalCost = Math.round(litersUsed * fuelPrice.price)

    await prisma.estimateHistory.create({
      data: {
        startName: input.startLocationName,
        endName: input.endLocationName,
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
        litersUsed: Math.round(litersUsed * 100) / 100,
        totalCost,
      },
    })

    const result: EstimateResult = {
      startLocation: input.startLocationName,
      endLocation: input.endLocationName,
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      vehicleName,
      fuelProvider: fuelPrice.provider.name,
      fuelName: fuelPrice.fuelName,
      fuelType: fuelPrice.fuelType,
      fuelPrice: fuelPrice.price,
      kmPerLiter,
      litersUsed: Math.round(litersUsed * 100) / 100,
      totalCost,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Error calculating estimate:", error)
    return { success: false, error: "An error occurred while calculating the estimate" }
  }
}

export async function getEstimateHistory(limit = 20) {
  try {
    return await prisma.estimateHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching estimate history:", error)
    return []
  }
}
