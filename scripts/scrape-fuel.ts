import { chromium } from "playwright"
import { scrapePertamina } from "@/scrapers/pertamina"
import { scrapeShell } from "@/scrapers/shell"
import { scrapeBP } from "@/scrapers/bp"
import { saveFuelPrices } from "@/actions/scrape"
import { writeScrapingLog } from "@/actions/scrape"

async function main() {
  console.log("=========================================")
  console.log("Fuel Scraper Started")
  console.log("=========================================")

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const allPrices = []

  try {
    const pertaminaPrices = await scrapePertamina(page)
    allPrices.push(...pertaminaPrices)

    await writeScrapingLog(
      "Pertamina",
      "SUCCESS",
      `Scraped ${pertaminaPrices.length} prices`
    )
  } catch (e: any) {
    await writeScrapingLog(
      "Pertamina",
      "FAILED",
      e?.message ?? String(e)
    )
  }

  try {
    const shellPrices = await scrapeShell(page)
    allPrices.push(...shellPrices)

    await writeScrapingLog(
      "Shell",
      "SUCCESS",
      `Scraped ${shellPrices.length} prices`
    )
  } catch (e: any) {
    await writeScrapingLog(
      "Shell",
      "FAILED",
      e?.message ?? String(e)
    )
  }

  try {
    const bpPrices = await scrapeBP(page)
    allPrices.push(...bpPrices)

    await writeScrapingLog(
      "BP",
      "SUCCESS",
      `Scraped ${bpPrices.length} prices`
    )
  } catch (e: any) {
    console.log("❌ BP scraping failed, skipping...")

    await writeScrapingLog(
      "BP",
      "FAILED",
      e?.message ?? "Scraping failed"
    )
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
