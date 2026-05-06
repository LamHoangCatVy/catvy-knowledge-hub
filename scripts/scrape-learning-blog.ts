/**
 * Content Scraping Template for catvy-learning-portfolio.vercel.app
 *
 * This script documents the approach for scraping content from
 * the Cat Vy Learning Portfolio site to populate the Docusaurus
 * knowledge hub. It is written as a documented template since
 * actual scraping requires network access and site structure
 * analysis that should be done at runtime.
 *
 * Usage:
 *   npx ts-node scripts/scrape-learning-blog.ts
 *
 * Requirements:
 *   - Node.js 20+
 *   - npm install puppeteer cheerio typescript
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  /** The base URL of the learning portfolio site */
  baseUrl: 'https://catvy-learning-portfolio.vercel.app',

  /** Output directory for scraped content */
  outputDir: path.resolve(__dirname, '..', 'scraped-content'),

  /** Delay between requests to be respectful (ms) */
  requestDelay: 1000,

  /** Maximum concurrent page loads */
  maxConcurrency: 3,

  /** Selectors - update these based on actual site structure */
  selectors: {
    /**
     * CSS selector for article/blog post links on listing pages.
     * Example: 'article a[href^="/blog/"]' or '.post-card a'
     * Adjust based on actual DOM inspection.
     */
    articleLinks: 'article a, .post-card a, a[href^="/blog/"]',

    /**
     * CSS selector for the main content of an article page.
     * Example: 'article .content' or '.prose' or '.markdown-body'
     */
    articleContent: 'article, .prose, .markdown-body, main',

    /**
     * CSS selector for the article title.
     * Example: 'h1' or '.article-title'
     */
    articleTitle: 'h1',

    /**
     * CSS selector for the article date.
     * Example: 'time' or '.published-date'
     */
    articleDate: 'time, .date, .published-date',

    /**
     * CSS selector for pagination / next page.
     * Example: '.pagination a[rel="next"]' or '.next a'
     */
    nextPage: '.pagination .next a, a[rel="next"]',
  },
};

// ============================================================================
// Types
// ============================================================================

interface ScrapedArticle {
  url: string;
  title: string;
  date: string;
  content: string; // HTML or Markdown
  tags: string[];
}

interface ScrapingResult {
  articles: ScrapedArticle[];
  errors: Array<{ url: string; error: string }>;
  stats: {
    totalPages: number;
    totalArticles: number;
    startTime: Date;
    endTime: Date;
  };
}

// ============================================================================
// Scraper Implementation
// ============================================================================

/**
 * Main scraping orchestrator.
 *
 * Approach:
 * 1. Start from the blog listing page
 * 2. Collect all article URLs from the current page
 * 3. Follow pagination to collect URLs from all listing pages
 * 4. Visit each article page and extract: title, date, content, tags
 * 5. Save results to JSON files for further processing
 *
 * IMPORTANT: Before running, inspect the target site's DOM structure
 * and update the `CONFIG.selectors` above to match actual elements.
 */
async function main() {
  console.log('==========================================');
  console.log('  Cat Vy Learning Portfolio Scraper');
  console.log('==========================================');
  console.log(`Target: ${CONFIG.baseUrl}`);
  console.log(`Output: ${CONFIG.outputDir}`);
  console.log();

  // ---- STEP 1: Verify Puppeteer is available ----
  let puppeteer: any;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.error(
      'ERROR: Puppeteer is not installed.\n' +
      'Run: npm install puppeteer\n' +
      'Then re-run this script.'
    );
    process.exit(1);
  }

  // ---- STEP 2: Launch browser ----
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const result: ScrapingResult = {
    articles: [],
    errors: [],
    stats: {
      totalPages: 0,
      totalArticles: 0,
      startTime: new Date(),
      endTime: new Date(),
    },
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // ---- STEP 3: Discover article URLs ----
    console.log('Discovering article URLs...');
    const urls = await discoverArticleUrls(page, CONFIG.baseUrl + '/blog');
    console.log(`Found ${urls.length} article URLs.`);

    // ---- STEP 4: Scrape each article ----
    console.log('Scraping articles...');
    let completed = 0;

    for (let i = 0; i < urls.length; i += CONFIG.maxConcurrency) {
      const batch = urls.slice(i, i + CONFIG.maxConcurrency);
      const results = await Promise.allSettled(
        batch.map((url) => scrapeArticle(page, url))
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          result.articles.push(r.value);
        } else {
          result.errors.push({
            url: batch[results.indexOf(r)],
            error: r.reason?.message || String(r.reason),
          });
        }
      }

      completed += batch.length;
      console.log(`  Progress: ${completed}/${urls.length}`);

      // Be respectful with rate limiting
      if (i + CONFIG.maxConcurrency < urls.length) {
        await sleep(CONFIG.requestDelay);
      }
    }

    result.stats.totalArticles = result.articles.length;
    result.stats.endTime = new Date();

    // ---- STEP 5: Save results ----
    saveResults(result);

    // ---- STEP 6: Generate Docusaurus markdown files ----
    generateDocusaurusFiles(result.articles);

    console.log('\nDone!');
    console.log(`  Articles scraped: ${result.articles.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
      console.log('  Failed URLs:');
      result.errors.forEach((e) => console.log(`    - ${e.url}: ${e.error}`));
    }
  } finally {
    await browser.close();
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Navigate through listing pages to discover all article URLs.
 *
 * Steps:
 * 1. Load the starting URL
 * 2. Extract article links using the configured selector
 * 3. Look for a "next page" link
 * 4. Repeat until no more pages
 */
async function discoverArticleUrls(
  page: any,
  startUrl: string
): Promise<string[]> {
  const urls = new Set<string>();
  let currentUrl: string | null = startUrl;
  let pageNum = 0;

  while (currentUrl && pageNum < 50) {
    // Safety limit of 50 pages
    pageNum++;
    console.log(`  Scanning listing page ${pageNum}: ${currentUrl}`);

    await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract article links
    const links: string[] = await page.$$eval(
      CONFIG.selectors.articleLinks,
      (elements: Element[]) =>
        elements
          .map((el) => (el as HTMLAnchorElement).href)
          .filter((href: string) => href && !href.includes('#'))
    );

    for (const link of links) {
      // Normalize URL: resolve relative, strip trailing slash
      try {
        const resolved = new URL(link, CONFIG.baseUrl).href.replace(/\/$/, '');
        urls.add(resolved);
      } catch {
        // Skip invalid URLs
      }
    }

    // Find next page link
    const nextPageLink = await page.$eval(
      CONFIG.selectors.nextPage,
      (el: Element | null) => (el as HTMLAnchorElement | null)?.href || null
    ).catch(() => null);

    currentUrl = nextPageLink;

    if (currentUrl) {
      await sleep(CONFIG.requestDelay);
    }
  }

  return Array.from(urls);
}

/**
 * Scrape a single article page.
 *
 * Extracts:
 * - Title (h1 or article title element)
 * - Date (time element or metadata)
 * - Content (article body as HTML)
 * - Tags (from tag elements or categories)
 */
async function scrapeArticle(
  page: any,
  url: string
): Promise<ScrapedArticle> {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(500); // Small delay for dynamic content to render

  const article = await page.evaluate((selectors: typeof CONFIG.selectors) => {
    // Helper: get text content safely
    const getText = (selector: string): string => {
      const el = document.querySelector(selector);
      return el?.textContent?.trim() || '';
    };

    // Helper: get HTML content safely
    const getHTML = (selector: string): string => {
      const el = document.querySelector(selector);
      return el?.innerHTML || '';
    };

    const title = getText(selectors.articleTitle);
    const date = getText(selectors.articleDate);
    const content = getHTML(selectors.articleContent);

    // Extract tags from common tag patterns
    const tags: string[] = [];
    document.querySelectorAll('.tag, .category, [data-tag]').forEach((el) => {
      const tag = el.textContent?.trim();
      if (tag) tags.push(tag);
    });

    return { title, date, content, tags };
  }, CONFIG.selectors);

  return {
    url,
    title: article.title,
    date: article.date,
    content: article.content,
    tags: article.tags,
  };
}

/**
 * Save raw scraping results to JSON.
 */
function saveResults(result: ScrapingResult): void {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Save all articles as a single JSON file
  const summaryPath = path.join(CONFIG.outputDir, 'scraped-articles.json');
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(result, null, 2),
    'utf-8'
  );
  console.log(`\nSaved summary to: ${summaryPath}`);

  // Save each article separately for easier processing
  const articlesDir = path.join(CONFIG.outputDir, 'articles');
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  for (const article of result.articles) {
    const slug = article.url
      .replace(CONFIG.baseUrl, '')
      .replace(/^\//, '')
      .replace(/\/$/, '')
      .replace(/\//g, '-')
      || 'index';

    const filePath = path.join(articlesDir, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf-8');
  }

  console.log(`Saved ${result.articles.length} individual articles to: ${articlesDir}`);
}

/**
 * Generate Docusaurus-compatible blog post files.
 *
 * This creates .mdx files with proper Docusaurus frontmatter
 * from the scraped content. Each file follows the pattern:
 *   blog/YYYY-MM-DD-slug/index.mdx
 *
 * NOTE: This is a template. You'll need to:
 *   1. Convert HTML content to MDX format
 *   2. Handle relative image URLs (download + serve locally)
 *   3. Map tags to your tags.yml entries
 *   4. Add proper authors references
 */
function generateDocusaurusFiles(articles: ScrapedArticle[]): void {
  const blogDir = path.resolve(__dirname, '..', 'blog');
  let generated = 0;

  for (const article of articles) {
    try {
      // Parse date from article or use current date as fallback
      const dateStr = article.date
        ? formatDate(article.date)
        : '1970-01-01';

      // Create slug from URL path
      const urlPath = new URL(article.url).pathname;
      const slug = urlPath
        .replace(/\/$/, '')
        .split('/')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        || 'untitled';

      // Create directory: blog/YYYY-MM-DD-slug/
      const dirName = `${dateStr}-${slug}`;
      const dirPath = path.join(blogDir, dirName);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Build the .mdx file content
      const mdxContent = generateMDXContent(article, dateStr, slug);

      const filePath = path.join(dirPath, 'index.mdx');
      fs.writeFileSync(filePath, mdxContent, 'utf-8');
      generated++;
    } catch (err) {
      console.error(
        `  Failed to generate file for ${article.url}: ${err}`
      );
    }
  }

  console.log(`Generated ${generated} Docusaurus blog posts in: ${blogDir}`);
}

/**
 * Generate MDX content with Docusaurus frontmatter.
 */
function generateMDXContent(
  article: ScrapedArticle,
  dateStr: string,
  slug: string
): string {
  const title = escapeYamlValue(article.title || 'Untitled');
  const description = escapeYamlValue(
    article.content
      ?.replace(/<[^>]*>/g, '')
      ?.substring(0, 160)
      ?.trim() || ''
  );

  const tags = article.tags
    .slice(0, 5)
    .map((t) => t.toLowerCase().replace(/\s+/g, '-'))
    .join(', ');

  // Build frontmatter
  const frontmatter = [
    '---',
    `slug: ${slug}`,
    `title: "${title}"`,
    `description: "${description}"`,
    'authors: [catvy]',
    `tags: [${tags}]`,
    `date: ${dateStr}`,
    '---',
    '',
  ].join('\n');

  // NOTE: The content below is raw HTML from scraping.
  // You should convert HTML to MDX format for best results.
  // Consider using a library like 'turndown' for HTML-to-Markdown conversion.
  const content = article.content || '';

  return frontmatter + '\n' + content;
}

// ============================================================================
// Utilities
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '1970-01-01';
    return date.toISOString().split('T')[0];
  } catch {
    return '1970-01-01';
  }
}

function escapeYamlValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

// ============================================================================
// Entry Point
// ============================================================================

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { main, discoverArticleUrls, scrapeArticle, CONFIG };
