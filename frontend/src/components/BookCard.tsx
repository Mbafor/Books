import React from "react";
import { Book } from "../types/books";

// Define a React functional component `BookCard`
// It receives a single prop `book` of type `Book`

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  return (
    <div className="book-card">
      {book.image && <img src={book.image} alt={book.title} />}
      <h3>{book.title}</h3>
      {book.author && <p>{book.author}</p>}
      <div className="book-meta">
        {book.price && <span style={{ marginRight: 10 }}>{book.price}</span>}
        {book.availability && <span>{book.availability}</span>}
      </div>
      {book.rating && <div className="book-rating">Rating: {book.rating} ⭐</div>}
      <a href={book.link} target="_blank" rel="noreferrer">
        View Book →
      </a>
    </div>
  );
};

// Export component for use in other parts of the app
export default BookCard;
