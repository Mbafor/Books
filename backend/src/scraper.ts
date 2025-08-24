import puppeteer from "puppeteer";
import { Book } from "./types/book.js";

const BASE = "http://books.toscrape.com";

/**
 * Scrapes book data from "Books to Scrape".
 *
 * - Can fetch multiple pages until a given limit is reached
 * - Supports fetching a single page (if `pageToFetch` is provided)
 *
 * @param limit - Maximum number of books to return (default: 50)
 * @param pageToFetch - Specific page number to scrape (1-based, optional)
 * @returns Array of Book objects
 */
export async function scrapeBooksToScrape(limit: number = 50, pageToFetch?: number): Promise<Book[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results: Book[] = [];
  const seen = new Set<string>(); // Track unique books to avoid duplicates
  let currentPage = 1;

  try {
    while (results.length < limit) {
      // Jump directly to requested page if provided
      if (pageToFetch) currentPage = pageToFetch;

      // Construct page URL (homepage vs paginated pages)
      const pageUrl =
        currentPage === 1
          ? `${BASE}/`
          : `${BASE}/catalogue/page-${currentPage}.html`;

      // Load page and wait for book cards to render
      await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector(".product_pod", { timeout: 10000 });

      // Extract book metadata from DOM
      const items: Omit<Book, "id">[] = await page.$$eval(".product_pod", (cards) =>
        cards.map((el) => {
          const title =
            el.querySelector("h3 a")?.getAttribute("title")?.trim() || "Untitled";
          const href = el.querySelector("h3 a")?.getAttribute("href") || "";
          const price = el.querySelector(".price_color")?.textContent?.trim() || "";
          const availability =
            el.querySelector(".instock.availability")?.textContent?.replace(/\s+/g, " ").trim() ||
            "";
          const rating = el.classList.contains("star-rating")
            ? Array.from(el.classList).find((c) => ["One","Two","Three","Four","Five"].includes(c))
            : el.querySelector(".star-rating")?.classList[1] || "";
          const imgSrc = el.querySelector("img")?.getAttribute("src") || "";

          // Return normalized shape of book data
          return {
            title,
            link: href,
            price,
            availability,
            rating,
            image: imgSrc,
            year: "Unknown", // Placeholder (not available on site)
            genres: ["General"] // Placeholder (not available on site)
          };
        })
      );

      // Normalize links, avoid duplicates, and push to results
      for (const it of items) {
        const linkAbs = new URL(it.link, pageUrl).href;
        const imgAbs = it.image ? new URL(it.image, pageUrl).href : undefined;
        const slug = linkAbs.replace(/\/$/, "").split("/").slice(-2).join("/");

        if (seen.has(slug)) continue; // Skip duplicate book
        seen.add(slug);

        results.push({
          id: slug,
          title: it.title,
          author: "Unknown", // Not available on site
          link: linkAbs,
          price: it.price,
          availability: it.availability,
          rating: it.rating,
          image: imgAbs
        });

        // Stop once we reach the required limit
        if (results.length >= limit) break;
      }

      // Exit if only a single page was requested
      if (pageToFetch) break;

      // If there's no "next" button, we've reached the last page
      const hasNext = await page.$(".next");
      if (!hasNext) break;

      currentPage += 1;
    }
  } finally {
    // Always close the browser, even if an error occurs
    await browser.close();
  }

  // Trim in case we scraped slightly more than the limit
  return results.slice(0, limit);
}
