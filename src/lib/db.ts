// IndexedDB wrapper for storing books, reading progress, and bookmarks
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Book {
  id: string;
  title: string;
  author?: string;
  cover?: string;
  fileUrl: string;
  fileName: string;
  addedAt: number;
  lastReadAt?: number;
  isFavorite: boolean;
  totalPages?: number;
  genre?: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  note?: string;
  createdAt: number;
}

interface KindleDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: { 'by-lastRead': number; 'by-favorite': number };
  };
  progress: {
    key: string;
    value: ReadingProgress;
  };
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-book': string };
  };
}

let dbInstance: IDBPDatabase<KindleDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<KindleDB>('kindle-app', 1, {
    upgrade(db) {
      // Books store
      const bookStore = db.createObjectStore('books', { keyPath: 'id' });
      bookStore.createIndex('by-lastRead', 'lastReadAt');
      bookStore.createIndex('by-favorite', 'isFavorite');

      // Progress store
      db.createObjectStore('progress', { keyPath: 'bookId' });

      // Bookmarks store
      const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
      bookmarkStore.createIndex('by-book', 'bookId');
    },
  });

  return dbInstance;
}

// Books
export async function addBook(book: Book) {
  const db = await getDB();
  await db.add('books', book);
}

export async function updateBook(book: Book) {
  const db = await getDB();
  await db.put('books', book);
}

export async function deleteBook(bookId: string) {
  const db = await getDB();
  await db.delete('books', bookId);
  await db.delete('progress', bookId);
  // Delete all bookmarks for this book
  const bookmarks = await getBookmarksByBook(bookId);
  for (const bookmark of bookmarks) {
    await db.delete('bookmarks', bookmark.id);
  }
}

export async function getBook(bookId: string) {
  const db = await getDB();
  return db.get('books', bookId);
}

export async function getAllBooks() {
  const db = await getDB();
  return db.getAll('books');
}

export async function getFavoriteBooks() {
  const db = await getDB();
  return db.getAllFromIndex('books', 'by-favorite', 1);
}

// Reading Progress
export async function saveProgress(progress: ReadingProgress) {
  const db = await getDB();
  await db.put('progress', progress);
  
  // Update lastReadAt in book
  const book = await getBook(progress.bookId);
  if (book) {
    book.lastReadAt = Date.now();
    await updateBook(book);
  }
}

export async function getProgress(bookId: string) {
  const db = await getDB();
  return db.get('progress', bookId);
}

// Bookmarks
export async function addBookmark(bookmark: Bookmark) {
  const db = await getDB();
  await db.add('bookmarks', bookmark);
}

export async function deleteBookmark(bookmarkId: string) {
  const db = await getDB();
  await db.delete('bookmarks', bookmarkId);
}

export async function getBookmarksByBook(bookId: string) {
  const db = await getDB();
  return db.getAllFromIndex('bookmarks', 'by-book', bookId);
}

export async function getAllBookmarks() {
  const db = await getDB();
  return db.getAll('bookmarks');
}
