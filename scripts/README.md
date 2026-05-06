# Scripts

Utility scripts for the Cat Vy Knowledge Hub.

## scrape-learning-blog.ts

A documented template script for scraping blog content from `catvy-learning-portfolio.vercel.app` and converting it to Docusaurus-compatible blog posts.

### Requirements

```bash
npm install puppeteer cheerio
# or
npm install puppeteer cheerio typescript ts-node --save-dev
```

### Usage

```bash
npx ts-node scripts/scrape-learning-blog.ts
```

### Before Running

1. Visit the target site and inspect its DOM structure
2. Update the `CONFIG.selectors` in the script to match actual CSS selectors for:
   - Article links on listing pages
   - Article content container
   - Article title element
   - Article date element
   - Pagination links
   - Tag elements
3. Adjust concurrency and delay settings as needed

### Output

The script produces two outputs:

1. **Raw JSON** in `scraped-content/`:
   - `scraped-articles.json` — all articles with metadata
   - `scraped-content/articles/*.json` — individual article files

2. **Docusaurus blog posts** in `blog/YYYY-MM-DD-slug/index.mdx`:
   - Proper frontmatter with slug, title, description, authors, tags, date
   - HTML content (should be manually converted to MDX)
   - Images will need to be downloaded and served locally

### Post-Processing Steps

After scraping, you'll need to:

1. Convert HTML content to MDX format (use `turndown` library or manual conversion)
2. Download and localize any images referenced in the content
3. Review and manually fix any formatting issues
4. Update tags in `blog/tags.yml` to match scraped content
5. Remove any template/placeholder content that shouldn't be published
6. Run `npx docusaurus build` to verify everything compiles

### Troubleshooting

- **Puppeteer won't launch:** Make sure Chrome/Chromium is installed. On macOS, the bundled Chromium should work. On Linux, you may need `--no-sandbox`.
- **Selectors return empty:** The target site likely has different DOM structure than the template. Use Chrome DevTools to inspect elements and update selectors.
- **Rate limiting:** If the target site rate-limits, increase `CONFIG.requestDelay` or reduce `CONFIG.maxConcurrency`.
