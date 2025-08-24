import { Router } from "express";
import { scrapeBooksToScrape } from "../scraper.js";
import { Book } from "../types/book.js";

const router = Router();

// Temporary in-memory storage (resets when server restarts)
let books: Book[] = [];

/**
 * GET /api/books
 * 
 * Returns paginated books from in-memory storage.
 * 
 * Query Parameters:
 * - page  (default: 1) → Which page of results
 * - limit (default: 10) → Number of books per page
 * 
 * Example: /api/books?page=2&limit=5
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
 * 
 * Triggers a fresh scrape from "Books to Scrape".
 * - Default limit is 50 books (can be overridden with ?limit=N)
 * - Updates in-memory `books` with the newly scraped results
 * 
 * Example: /api/books/scrape?limit=20
 */
router.get("/scrape", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 50);

    // Run the scraper and overwrite the in-memory dataset
    const fresh = await scrapeBooksToScrape(limit);
    books = fresh;

    res.json({
      success: true,
      message: "Scraping completed successfully",
      booksScraped: books.length,
      data: books,
    });
  } catch (error) {
    // Return structured error response
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
