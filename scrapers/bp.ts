import { Page } from "playwright"
import { FuelPriceData } from "@/actions/scrape"
import { determineFuelType } from "./fuel-types"

export async function scrapeBP(page: Page): Promise<FuelPriceData[]> {
  console.log("\n🚀 Scraping BP...")

  await page.goto(
    "https://www.bp.com/id_id/indonesia/home/produk-dan-layanan/spbu/harga.html",
    { waitUntil: "domcontentloaded" }
  )

  try {
    const cookieBtn = page.locator("button.nr-cookie-accept")

    if (await cookieBtn.isVisible({ timeout: 8000 })) {
      console.log("🍪 Accepting BP cookies...")
      await cookieBtn.click()
      await page.waitForTimeout(3000)
    }
  } catch {
    console.log("✅ Cookie popup not found")
  }

  console.log("📸 Taking screenshot for debugging...")

  await page.screenshot({
    path: "bp-debug.png",
    fullPage: true,
  })

  console.log("✅ Screenshot saved: bp-debug.png")

  await page.waitForSelector(".nr-table-component table", {
    timeout: 60000,
  })

  const rows = await page.$$eval(
    ".nr-table-component table tbody tr",
    (trs) =>
      trs.slice(1).map((tr) => {
        const name = tr.querySelector("th")?.innerText.trim() || ""
        const tds = tr.querySelectorAll("td")

        return {
          name,
          jawaTimur: tds[1]?.innerText.trim() || "",
        }
      })
  )

  const results: FuelPriceData[] = []

  for (const row of rows) {
    if (!row.name) continue

    const priceNum = parseInt(row.jawaTimur.replace(/\D/g, ""))
    if (isNaN(priceNum)) continue

    results.push({
      provider: "BP",
      fuelName: row.name,
      fuelType: determineFuelType(row.name),
      price: priceNum,
    })
  }

  console.log(`✅ BP Scraped ${results.length} prices`)
  return results
}
