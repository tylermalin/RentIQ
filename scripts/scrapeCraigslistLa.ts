/**
 * Simple Craigslist LA scraper for Approval MVP using Puppeteer.
 *
 * NOTE: Before using this in production, review Craigslist's Terms of Service and robots.txt.
 * Use gentle rate limits and do not hammer the site.
 */

import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import puppeteer, { type Page } from "puppeteer";
import { parseEligibilityFromListingFields } from "../lib/eligibilityParsing";
import type { Listing } from "../lib/listings";

const CRAIGSLIST_BASE = "https://losangeles.craigslist.org";
const SEARCH_URL =
  CRAIGSLIST_BASE +
  "/search/apa?hasPic=1&availabilityMode=0&bundleDuplicates=1";

type RawResult = {
  url: string;
  title: string;
  price?: number;
  beds?: number;
  baths?: number;
  neighborhood?: string;
};

async function scrapeSearchPage(page: Page): Promise<RawResult[]> {
  await page.goto(SEARCH_URL, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  // Wait a bit more for any dynamic content
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check if page loaded correctly
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Try to find results using multiple selectors
  const selectors = [".result-row", "li.result-row", ".cl-search-result", "article[data-pid]"];
  let foundSelector = "";
  
  for (const selector of selectors) {
    const count = await page.$$eval(selector, (els) => els.length);
    if (count > 0) {
      console.log(`Found ${count} elements with selector: ${selector}`);
      foundSelector = selector;
      break;
    }
  }

  // Craigslist loads results in static HTML, but we still use Puppeteer in case there is JS rendering or anti-bot behavior.
  const html = await page.content();
  const $ = cheerio.load(html);

  const results: RawResult[] = [];

  // Try the found selector first, then fallback to .result-row
  const selectorToUse = foundSelector || ".result-row";
  console.log(`Using selector: ${selectorToUse}`);

  $(selectorToUse).each((_, el) => {
    const row = $(el);

    const link = row.find(".result-title, a.result-title").first();
    const title = link.text().trim();
    const href = link.attr("href");
    if (!href || !title) return;

    const priceText = row.find(".result-price").first().text().replace(/[^\d]/g, "");
    const price = priceText ? parseInt(priceText, 10) : undefined;

    const housingText = row.find(".housing").text();
    let beds: number | undefined;
    let baths: number | undefined;

    if (housingText) {
      const matchBeds = housingText.match(/(\d+)\s*br/);
      const matchBaths = housingText.match(/(\d+(\.\d+)?)\s*ba/);
      if (matchBeds) beds = parseInt(matchBeds[1], 10);
      if (matchBaths) baths = parseFloat(matchBaths[1]);
    }

    const hoodText = row.find(".result-hood").text().trim();
    const neighborhood = hoodText ? hoodText.replace(/^\(|\)$/g, "").trim() : undefined;

    results.push({
      url: href.startsWith("http") ? href : CRAIGSLIST_BASE + href,
      title,
      price,
      beds,
      baths,
      neighborhood,
    });
  });

  if (results.length === 0) {
    // Debug: Check what's actually in the HTML
    const bodyText = $("body").text();
    const hasResults = bodyText.includes("result") || bodyText.includes("apartment") || bodyText.includes("rent");
    console.log(`Body contains result-related text: ${hasResults}`);
    
    // Check for common Craigslist patterns
    const hasResultRow = html.includes("result-row");
    const hasClSearch = html.includes("cl-search");
    console.log(`HTML contains 'result-row': ${hasResultRow}, contains 'cl-search': ${hasClSearch}`);
    
    // Try to find any links to apartment listings
    const apartmentLinks = $("a[href*='/apa/']").length;
    console.log(`Found ${apartmentLinks} links containing '/apa/'`);
    
    if (apartmentLinks > 0) {
      console.log("Attempting to parse links directly...");
      $("a[href*='/apa/']").each((_, el) => {
        const link = $(el);
        const href = link.attr("href");
        const title = link.text().trim();
        if (href && title && title.length > 10) {
          // Try to find price in nearby elements
          const parent = link.parent();
          const priceMatch = parent.text().match(/\$[\d,]+/);
          const price = priceMatch ? parseInt(priceMatch[0].replace(/[^\d]/g, ""), 10) : undefined;
          
          results.push({
            url: href.startsWith("http") ? href : CRAIGSLIST_BASE + href,
            title,
            price,
            beds: undefined,
            baths: undefined,
            neighborhood: undefined,
          });
        }
      });
    }
  }

  return results;
}

async function scrapeDetail(
  browser: puppeteer.Browser,
  raw: RawResult
): Promise<Listing | null> {
  const page = await browser.newPage();
  try {
    await page.goto(raw.url, { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);

    const postingBody = $("#postingbody").text().trim();
    const description = postingBody
      .replace(/^QR Code Link to This Post\s*/i, "")
      .trim();

    const city = "Los Angeles";

    const imageUrls: string[] = [];
    $("#thumbs img").each((_, imgEl) => {
      const img = $(imgEl);
      const src = img.attr("src");
      if (src) {
        imageUrls.push(src.replace(/50x50c/, "600x450"));
      }
    });

    const parsedEligibility = parseEligibilityFromListingFields(
      raw.title,
      description
    );

    // Generate unique ID from full URL to avoid collisions
    // Use full base64url encoding of the URL to ensure uniqueness
    const id =
      "craigslist_la_" +
      Buffer.from(raw.url).toString("base64url");

    const listing: Listing = {
      id,
      title: raw.title,
      city,
      rent: raw.price ?? 0,
      beds: raw.beds ?? 0,
      baths: raw.baths ?? 1,
      neighborhood: raw.neighborhood,
      description,
      source: "craigslist_la",

      primaryImageUrl: imageUrls[0],
      imageUrls,

      incomeMultiplier: parsedEligibility.incomeMultiplier,
      incomeFlexibility: parsedEligibility.incomeFlexibility,
      minCreditScore: parsedEligibility.minCreditScore,
      creditFlexibility: parsedEligibility.creditFlexibility,
      cosignerAllowed: parsedEligibility.cosignerAllowed,
      guarantorAllowed: parsedEligibility.guarantorAllowed,
      extraDepositAllowed: parsedEligibility.extraDepositAllowed,
      keywords: parsedEligibility.keywords,
      primeCandidateScore: parsedEligibility.primeCandidateScore,
    };

    await page.close();
    return listing;
  } catch (err) {
    console.error(`Error scraping detail for ${raw.url}:`, err);
    await page.close();
    return null;
  }
}

async function main() {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: "new",
  });

  try {
    console.log("Scraping Craigslist Los Angeles search page...");
    const page = await browser.newPage();
    const rawResults = await scrapeSearchPage(page);
    await page.close();

    console.log(`Found ${rawResults.length} search results. Limiting for MVP.`);
    const limited = rawResults.slice(0, 30);

    const listings: Listing[] = [];
    for (const raw of limited) {
      console.log(`Scraping detail: ${raw.title} - ${raw.url}`);
      const detailed = await scrapeDetail(browser, raw);
      if (detailed) {
        listings.push(detailed);
      }
      // Gentle delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    console.log(`Successfully built ${listings.length} listings.`);

    const outputDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "craigslist_la_seed.ts");

    const fileContents =
      `// Auto-generated Craigslist LA seed file. Do not edit by hand.\n` +
      `// Run scripts/scrapeCraigslistLa.ts to regenerate.\n\n` +
      `import type { Listing } from "../lib/listings";\n\n` +
      `export const CRAIGSLIST_LA_SEED: Listing[] = ${JSON.stringify(
        listings,
        null,
        2
      )};\n`;

    fs.writeFileSync(outputPath, fileContents, "utf8");
    console.log(`Wrote ${listings.length} listings to ${outputPath}`);
  } catch (err) {
    console.error("Error during scrape:", err);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
