import { Router } from "express";
import { scrapeBooksToScrape } from "../scraper.js";
import { Book } from "../types/book.js";

const router = Router();

// In-memory storage for scraped books
let books: Book[] = [];

/**
 * GET /api/books
 * Optional query params:
 * - page (default 1)
 * - limit (default 10)
 */
router.get("/", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedBooks = books.slice(startIndex, endIndex);

  res.json({
    success: true,
    page,
    limit,
    totalItems: books.length,
    totalPages: Math.ceil(books.length / limit),
    data: paginatedBooks,
  });
});

/**
 * GET /api/books/scrape?limit=50
 * Scrape books from the website (fresh data)
 */
router.get("/scrape", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const fresh = await scrapeBooksToScrape(limit);
    books = fresh;

    res.json({
      success: true,
      message: "Scraping completed successfully",
      booksScraped: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
