/**
 * Fix duplicate listing IDs in the seed file by generating unique IDs
 */

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

const seedFilePath = path.join(process.cwd(), "data", "craigslist_la_seed.ts");

// Read the seed file
const seedContent = fs.readFileSync(seedFilePath, "utf8");

// Extract the listings array
const listingsMatch = seedContent.match(/export const CRAIGSLIST_LA_SEED: Listing\[\] = (\[[\s\S]*\]);/);
if (!listingsMatch) {
  console.error("Could not find listings array in seed file");
  process.exit(1);
}

// Parse the JSON
const listings = JSON.parse(listingsMatch[1]);

// Generate unique IDs for each listing
const fixedListings = listings.map((listing: any, index: number) => {
  // Create a unique ID based on title, rent, neighborhood, and index
  // This ensures uniqueness even if other fields are similar
  const uniqueString = `${listing.title}_${listing.rent}_${listing.neighborhood || ''}_${listing.city || ''}_${index}`;
  const hash = createHash("md5").update(uniqueString).digest("hex");
  
  // Use a shorter, URL-safe ID: craigslist_la_ + first 32 chars of hash
  const newId = `craigslist_la_${hash.slice(0, 32)}`;
  
  return {
    ...listing,
    id: newId,
  };
});

// Generate new file content
const newFileContent =
  `// Auto-generated Craigslist LA seed file. Do not edit by hand.\n` +
  `// Run scripts/scrapeCraigslistLa.ts to regenerate.\n\n` +
  `import type { Listing } from "../lib/listings";\n\n` +
  `export const CRAIGSLIST_LA_SEED: Listing[] = ${JSON.stringify(
    fixedListings,
    null,
    2
  )};\n`;

// Write the fixed file
fs.writeFileSync(seedFilePath, newFileContent, "utf8");

console.log(`Fixed ${fixedListings.length} listings with unique IDs`);
console.log(`Sample IDs:`);
fixedListings.slice(0, 3).forEach((listing: any) => {
  console.log(`  - ${listing.id}: ${listing.title.substring(0, 50)}...`);
});

