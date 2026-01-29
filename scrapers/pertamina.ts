import { Page } from "playwright"
import { determineFuelType } from "./fuel-types"
import { FuelPriceData } from "@/actions/scrape"

export async function scrapePertamina(page: Page): Promise<FuelPriceData[]> {
  console.log("\n🚀 Scraping Pertamina...")

  await page.goto("https://mypertamina.id/about/product-price")

  await page.waitForSelector("input[placeholder='Cari nama provinsi']")
  await page.fill("input[placeholder='Cari nama provinsi']", "Jawa Timur")

  await page.waitForTimeout(2000)

  const rows = await page.$$eval("table tbody tr", (trs) =>
    trs.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"))
      return tds.map((td) => td.innerText.trim())
    })
  )

  if (!rows.length) return []

  const jawaTimurRow = rows[0]

  const fuels = [
    "Pertalite",
    "Pertamax",
    "Pertamax Turbo",
    "Pertamax Green",
    "Biosolar Subsidi",
    "Dexlite",
    "Pertamina Dex",
    "Biosolar Non Subsidi",
    "Pertamax Pertashop",
  ]

  const result: FuelPriceData[] = []

  for (let i = 0; i < fuels.length; i++) {
    const rawPrice = jawaTimurRow[i + 1]
    if (!rawPrice || rawPrice === "-") continue

    const price = parseInt(rawPrice.replace(/\D/g, ""))
    if (isNaN(price)) continue

    result.push({
      provider: "Pertamina",
      fuelName: fuels[i],
      fuelType: determineFuelType(fuels[i]),
      price,
    })
  }

  return result
}
