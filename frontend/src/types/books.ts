export interface Book {
  id: string;
  title: string;
  author?: string;
  link: string;
  price?: string;
  availability?: string;
  rating?: string;
  image?: string;
  year?: string;
  genres?: string[];
}

export interface BookApiResponse {
  success: boolean;
  data: Book[];
  page: number;         // current page
  limit: number;        // number of items per page
  totalItems: number;   // total number of books
  totalPages: number;   // total number of pages
  error?: string;
}

export interface ScrapeApiResponse {
  success: boolean;
  message: string;
  booksScraped?: number;
  data?: Book[];
  error?: string;
}
