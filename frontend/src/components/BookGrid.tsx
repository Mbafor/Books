import React from "react";
import { Book } from "../types/books";
import BookCard from "./BookCard";

const BookGrid: React.FC<{ books: Book[] }> = ({ books }) => {
  return (
    <div className="book-grid">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
};

export default BookGrid;
