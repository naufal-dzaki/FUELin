import { chromium } from "playwright"
import { scrapePertamina } from "@/scrapers/pertamina"
import { scrapeShell } from "@/scrapers/shell"
import { scrapeBP } from "@/scrapers/bp"
import { saveFuelPrices } from "@/actions/fuel"

async function main() {
  console.log("=========================================")
  console.log("Fuel Scraper Started")
  console.log("=========================================")

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const allPrices = []

  allPrices.push(...(await scrapePertamina(page)))
  allPrices.push(...(await scrapeShell(page)))

  try {
    allPrices.push(...(await scrapeBP(page)))
  } catch (err) {
    console.log("❌ BP scraping failed, skipping...")
  }

  console.log("\n=========================================")
  console.log(`✅ Total scraped: ${allPrices.length} prices`)
  console.log("=========================================")

  if (allPrices.length > 0) {
    await saveFuelPrices(allPrices)
  }

  await browser.close()
  console.log("\n🎉 Scraping finished successfully!")
}

main().catch(console.error)
