"use server"

import type { RouteResult } from "@/lib/types"
import { VehicleProfile } from "@/lib/route-profile"

const ORS_API_URL = "https://api.openrouteservice.org/v2/directions"

export async function calculateRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  profile: VehicleProfile = "driving-car"
): Promise<RouteResult | null> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY
  
  if (!apiKey) {
    console.error("OpenRouteService API key not configured")
    return null
  }
  
  try {
    const response = await fetch(`${ORS_API_URL}/${profile}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        coordinates: [
          [startLon, startLat],
          [endLon, endLat],
        ],
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenRouteService error:", errorData)
      return null
    }
    
    const data = await response.json()
    
    if (!data.routes || data.routes.length === 0) {
      return null
    }
    
    const route = data.routes[0]
    const distanceKm = route.summary.distance / 1000
    const durationMin = route.summary.duration / 60
    
    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin: Math.round(durationMin),
    }
  } catch (error) {
    console.error("Error calculating route:", error)
    return null
  }
}
