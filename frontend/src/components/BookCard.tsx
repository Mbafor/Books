import React from "react";
import { Book } from "../types/books";

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

export default BookCard;
