import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { AddBookDialog } from "@/components/AddBookDialog";
import { Book, getAllBooks, addBook as addBookToDB, updateBook, deleteBook, getProgress } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [progresses, setProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    // Apply dark mode
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // Filter books based on search query
    if (!searchQuery) {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBooks(
        books.filter(
          (book) =>
            book.title.toLowerCase().includes(query) ||
            book.author?.toLowerCase().includes(query) ||
            book.genre?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, books]);

  const loadBooks = async () => {
    const allBooks = await getAllBooks();
    setBooks(allBooks);

    // Load progress for each book
    const progressData: Record<string, number> = {};
    for (const book of allBooks) {
      const progress = await getProgress(book.id);
      if (progress) {
        progressData[book.id] = progress.percentage;
      }
    }
    setProgresses(progressData);
  };

  const handleAddBook = async (book: Book) => {
    await addBookToDB(book);
    loadBooks();
  };

  const handleToggleFavorite = async (book: Book) => {
    const updated = { ...book, isFavorite: !book.isFavorite };
    await updateBook(updated);
    loadBooks();
    toast.success(updated.isFavorite ? "Added to favorites" : "Removed from favorites");
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteBook(bookId);
    loadBooks();
    toast.success("Book deleted");
  };

  const recentBooks = [...books]
    .filter((b) => b.lastReadAt)
    .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
    .slice(0, 6);

  const favoriteBooks = books.filter((b) => b.isFavorite);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddBook={() => setAddDialogOpen(true)}
        onSearch={setSearchQuery}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      <main className="container px-4 py-8">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <BookOpen className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No books yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start building your personal library by adding your first PDF book.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Books ({filteredBooks.length})</TabsTrigger>
              <TabsTrigger value="recent">Continue Reading ({recentBooks.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorites ({favoriteBooks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    progress={progresses[book.id]}
                    onOpen={() => navigate(`/reader/${book.id}`)}
                    onToggleFavorite={() => handleToggleFavorite(book)}
                    onDelete={() => handleDeleteBook(book.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              {recentBooks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No recently read books</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {recentBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      progress={progresses[book.id]}
                      onOpen={() => navigate(`/reader/${book.id}`)}
                      onToggleFavorite={() => handleToggleFavorite(book)}
                      onDelete={() => handleDeleteBook(book.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              {favoriteBooks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No favorite books yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {favoriteBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      progress={progresses[book.id]}
                      onOpen={() => navigate(`/reader/${book.id}`)}
                      onToggleFavorite={() => handleToggleFavorite(book)}
                      onDelete={() => handleDeleteBook(book.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <AddBookDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddBook}
      />
    </div>
  );
};

export default Index;
