import React, { useEffect, useMemo, useState } from "react";
import { Book, BookApiResponse, ScrapeApiResponse } from "./types/books";
import SearchBar from "./components/SearchBar";
import BookGrid from "./components/BookGrid";
import { useDebounce } from "./hooks/useDebounce";
import "./App.css";

//  Replace with local backend URL http://localhost:5000/api/books to Run locally
const API_BASE = "https://books-302a.onrender.com/api/books";

function App() {
  // --- State Management ---
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const debounced = useDebounce(search, 300);

  // Filter books client-side
  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author ?? "").toLowerCase().includes(q)
    );
  }, [books, debounced]);

  /**
   * Fetch books (paginated)
   */
  const loadBooks = async (pageNumber: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?page=${pageNumber}&limit=${limit}`);
      const data: BookApiResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load");

      setBooks(data.data);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh books by scraping new data
   */
  const refreshBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scrape?limit=60`);
      const data: ScrapeApiResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to scrape");

      setBooks(data.data ?? []);
      setPage(1);
      setTotalPages(Math.ceil((data.data?.length ?? 0) / limit));
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="app-container">
      <header>
        <h1>📚 Books to Scrape</h1>
        <div className="header-actions">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by title or author..."
          />
          <button onClick={refreshBooks} className="refresh-btn">
            Refresh Data
          </button>
        </div>
      </header>

      <main>
        {loading && <div className="status loading">Loading…</div>}
        {error && <div className="status error">Error: {error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="status empty">📭 No books found.</div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <>
            <BookGrid books={filtered} />
            <div className="pagination">
              <button
                onClick={handlePrev}
                disabled={page <= 1}
                className="pagination-btn"
              >
                ⬅ Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page >= totalPages}
                className="pagination-btn"
              >
                Next ➡
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
