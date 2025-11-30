# Craigslist Scraper Notes

## Current Status

The scraper (`scripts/scrapeCraigslistLa.ts`) is implemented but **currently returns 0 results** because:

- **Craigslist uses JavaScript/client-side rendering** - The listings are loaded dynamically after the initial HTML loads
- **Cheerio only parses static HTML** - It cannot execute JavaScript or wait for dynamic content

## Solutions

### Option 1: Use Puppeteer (Recommended for Production)

Install Puppeteer to handle JavaScript-rendered content:

```bash
npm install puppeteer
npm install -D @types/puppeteer
```

Then update `scripts/scrapeCraigslistLa.ts` to use Puppeteer instead of fetch + cheerio.

### Option 2: Use Mock Data (Current MVP)

The app currently uses `MOCK_LISTINGS` from `lib/listings.ts` which includes 10 sample LA listings. This works fine for MVP development.

### Option 3: Manual Seed Data

You can manually create `data/craigslist_la_seed.ts` with real listings if you have the data from another source.

## Current Behavior

- Scraper runs successfully but finds 0 listings
- App falls back to `MOCK_LISTINGS` (10 sample listings)
- All functionality works with mock data
- Eligibility parsing is ready to use when real data is available

## Next Steps

1. **For MVP**: Continue using mock data - everything works
2. **For Production**: Implement Puppeteer-based scraper or use a different data source
3. **For Testing**: Manually add real listings to `data/craigslist_la_seed.ts` if needed

