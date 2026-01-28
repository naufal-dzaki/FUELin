export function determineFuelType(name: string): string {
  const lower = name.toLowerCase()

  if (lower.includes("diesel") || lower.includes("dex") || lower.includes("solar"))
    return "Diesel"

  if (lower.includes("nitro") || lower.includes("turbo") || lower.includes("98"))
    return "RON 98"

  if (lower.includes("ultimate") || lower.includes("v-power") || lower.includes("95"))
    return "RON 95"

  if (lower.includes("super") || lower.includes("pertamax") || lower.includes("92"))
    return "RON 92"

  if (lower.includes("pertalite") || lower.includes("90")) return "RON 90"

  return "RON 92"
}
