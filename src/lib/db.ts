// IndexedDB wrapper for storing books, reading progress, bookmarks, annotations, highlights, collections, and stats
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
  collections?: string[]; // Array of collection IDs
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  updatedAt: number;
  timeSpent?: number; // Total reading time in seconds
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  note?: string;
  createdAt: number;
}

export interface Annotation {
  id: string;
  bookId: string;
  page: number;
  text: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  page: number;
  text: string;
  color: string; // yellow, green, blue, pink, purple
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: number;
  bookCount?: number;
}

export interface ReadingStats {
  bookId: string;
  totalTimeSpent: number; // in seconds
  pagesRead: number;
  lastReadAt: number;
  readingSpeed?: number; // pages per minute
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
  annotations: {
    key: string;
    value: Annotation;
    indexes: { 'by-book': string };
  };
  highlights: {
    key: string;
    value: Highlight;
    indexes: { 'by-book': string };
  };
  collections: {
    key: string;
    value: Collection;
  };
  stats: {
    key: string;
    value: ReadingStats;
  };
}

let dbInstance: IDBPDatabase<KindleDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<KindleDB>('kindle-app', 2, {
    upgrade(db, oldVersion) {
      // Books store
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('by-lastRead', 'lastReadAt');
        bookStore.createIndex('by-favorite', 'isFavorite');
      }

      // Progress store
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'bookId' });
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains('bookmarks')) {
        const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
        bookmarkStore.createIndex('by-book', 'bookId');
      }

      // Annotations store (new)
      if (!db.objectStoreNames.contains('annotations')) {
        const annotationStore = db.createObjectStore('annotations', { keyPath: 'id' });
        annotationStore.createIndex('by-book', 'bookId');
      }

      // Highlights store (new)
      if (!db.objectStoreNames.contains('highlights')) {
        const highlightStore = db.createObjectStore('highlights', { keyPath: 'id' });
        highlightStore.createIndex('by-book', 'bookId');
      }

      // Collections store (new)
      if (!db.objectStoreNames.contains('collections')) {
        db.createObjectStore('collections', { keyPath: 'id' });
      }

      // Stats store (new)
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'bookId' });
      }
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

// Annotations
export async function addAnnotation(annotation: Annotation) {
  const db = await getDB();
  await db.add('annotations', annotation);
}

export async function updateAnnotation(annotation: Annotation) {
  const db = await getDB();
  await db.put('annotations', annotation);
}

export async function deleteAnnotation(annotationId: string) {
  const db = await getDB();
  await db.delete('annotations', annotationId);
}

export async function getAnnotationsByBook(bookId: string) {
  const db = await getDB();
  return db.getAllFromIndex('annotations', 'by-book', bookId);
}

// Highlights
export async function addHighlight(highlight: Highlight) {
  const db = await getDB();
  await db.add('highlights', highlight);
}

export async function deleteHighlight(highlightId: string) {
  const db = await getDB();
  await db.delete('highlights', highlightId);
}

export async function getHighlightsByBook(bookId: string) {
  const db = await getDB();
  return db.getAllFromIndex('highlights', 'by-book', bookId);
}

// Collections
export async function addCollection(collection: Collection) {
  const db = await getDB();
  await db.add('collections', collection);
}

export async function updateCollection(collection: Collection) {
  const db = await getDB();
  await db.put('collections', collection);
}

export async function deleteCollection(collectionId: string) {
  const db = await getDB();
  await db.delete('collections', collectionId);
}

export async function getAllCollections() {
  const db = await getDB();
  return db.getAll('collections');
}

export async function getCollection(collectionId: string) {
  const db = await getDB();
  return db.get('collections', collectionId);
}

// Reading Stats
export async function saveStats(stats: ReadingStats) {
  const db = await getDB();
  await db.put('stats', stats);
}

export async function getStats(bookId: string) {
  const db = await getDB();
  return db.get('stats', bookId);
}

export async function getAllStats() {
  const db = await getDB();
  return db.getAll('stats');
}
