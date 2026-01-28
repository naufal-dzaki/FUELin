import { Page } from "playwright"
import { determineFuelType } from "./fuel-types"
import { FuelPriceData } from "@/actions/fuel"

export async function scrapeShell(page: Page): Promise<FuelPriceData[]> {
  console.log("\n🚀 Scraping Shell...")

  await page.goto(
    "https://www.shell.co.id/in_id/pengendara-bermotor/bahan-bakar-shell/how-shell-price-fuel.html"
  )

  await page.waitForSelector("table tr")

  const rows = await page.$$eval("table tr", (trs) =>
    trs.slice(1).map((tr) => {
      const tds = tr.querySelectorAll("td")
      return {
        name: tds[0]?.innerText.trim() || "",
        lokasi: tds[1]?.innerText.trim() || "",
        price: tds[2]?.innerText.trim() || "",
      }
    })
  )

  const result: FuelPriceData[] = []

  for (const row of rows) {
    if (!row.name) continue
    if (!row.lokasi.toLowerCase().includes("jawa timur")) continue

    const price = parseInt(row.price.replace(/\D/g, ""))
    if (isNaN(price)) continue

    result.push({
      provider: "Shell",
      fuelName: row.name,
      fuelType: determineFuelType(row.name),
      price,
    })
  }

  return result
}
