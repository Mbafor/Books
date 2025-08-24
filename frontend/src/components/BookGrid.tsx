import React from "react";
import { Book } from "../types/books";
import BookCard from "./BookCard"; 

// BookGrid component takes an array of books as a prop
const BookGrid: React.FC<{ books: Book[] }> = ({ books }) => {
  return (
    <div className="book-grid"> {}
      {books.map((b) => (
        // Each book is passed into the BookCard component
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
};

export default BookGrid; // Exporting BookGrid so it can be used in other parts of the app
