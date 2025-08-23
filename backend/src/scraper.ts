import puppeteer from "puppeteer";
import { Book } from "./types/book.js";

const BASE = "http://books.toscrape.com";

/**
 * Scrape Books to Scrape with support for fetching a specific page.
 *
 * @param limit - Total number of books to fetch (default 50)
 * @param pageToFetch - Optional: fetch only this page (1-based)
 */
export async function scrapeBooksToScrape(limit: number = 50, pageToFetch?: number): Promise<Book[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results: Book[] = [];
  const seen = new Set<string>();
  let currentPage = 1;

  try {
    while (results.length < limit) {
      // If a specific page is requested, jump directly there
      if (pageToFetch) currentPage = pageToFetch;

      const pageUrl =
        currentPage === 1
          ? `${BASE}/`
          : `${BASE}/catalogue/page-${currentPage}.html`;

      await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector(".product_pod", { timeout: 10000 });

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

          return {
            title,
            link: href,
            price,
            availability,
            rating,
            image: imgSrc,
            year: "Unknown",
            genres: ["General"]
          };
        })
      );

      for (const it of items) {
        const linkAbs = new URL(it.link, pageUrl).href;
        const imgAbs = it.image ? new URL(it.image, pageUrl).href : undefined;
        const slug = linkAbs.replace(/\/$/, "").split("/").slice(-2).join("/");

        if (seen.has(slug)) continue;
        seen.add(slug);

        results.push({
          id: slug,
          title: it.title,
          author: "Unknown",
          link: linkAbs,
          price: it.price,
          availability: it.availability,
          rating: it.rating,
          image: imgAbs
        });

        if (results.length >= limit) break;
      }

      // Stop if fetching a specific page
      if (pageToFetch) break;

      const hasNext = await page.$(".next");
      if (!hasNext) break;

      currentPage += 1;
    }
  } finally {
    await browser.close();
  }

  return results.slice(0, limit);
}
