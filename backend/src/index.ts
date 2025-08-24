import express from "express";
import cors from "cors";
import booksRouter from "./routes/books.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-origin requests (e.g. frontend on a different domain)
app.use(cors());

// Parse incoming JSON payloads (needed for APIs that accept JSON bodies)
app.use(express.json());

// Mount books API routes under /api/books
app.use("/api/books", booksRouter);

// Start the server and listen on the given port
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
