import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Bookmark as BookmarkIcon,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { getBook, getProgress, saveProgress, getBookmarksByBook, addBookmark, Bookmark } from "@/lib/db";
import { Book } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const READING_THEMES = {
  light: "",
  dark: "dark",
  sepia: "theme-sepia",
  night: "theme-night",
};

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [theme, setTheme] = useState<keyof typeof READING_THEMES>("light");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!bookId) return;

    const loadBook = async () => {
      const bookData = await getBook(bookId);
      if (!bookData) {
        toast.error("Book not found");
        navigate("/");
        return;
      }
      setBook(bookData);

      // Load progress
      const progress = await getProgress(bookId);
      if (progress) {
        setCurrentPage(progress.currentPage);
      }

      // Load bookmarks
      const bookmarkData = await getBookmarksByBook(bookId);
      setBookmarks(bookmarkData);
    };

    loadBook();
  }, [bookId, navigate]);

  useEffect(() => {
    if (!book || !numPages) return;

    const saveCurrentProgress = async () => {
      await saveProgress({
        bookId: book.id,
        currentPage,
        totalPages: numPages,
        percentage: Math.round((currentPage / numPages) * 100),
        updatedAt: Date.now(),
      });
    };

    saveCurrentProgress();
  }, [currentPage, book, numPages]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
  };

  const handleAddBookmark = async () => {
    if (!book) return;

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      bookId: book.id,
      page: currentPage,
      createdAt: Date.now(),
    };

    await addBookmark(newBookmark);
    setBookmarks([...bookmarks, newBookmark]);
    toast.success("Bookmark added!");
  };

  const isBookmarked = bookmarks.some((b) => b.page === currentPage);

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", READING_THEMES[theme])}>
      {/* Header Controls */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b transition-transform",
          !showControls && "-translate-y-full"
        )}
      >
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">
              <h2 className="font-semibold text-sm line-clamp-1">{book.title}</h2>
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {numPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setScale(Math.min(2.0, scale + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              variant={isBookmarked ? "default" : "ghost"}
              size="icon"
              onClick={handleAddBookmark}
            >
              <BookmarkIcon className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="flex items-center justify-center min-h-screen pt-14 pb-20 px-4"
        onClick={() => setShowControls(!showControls)}
      >
        <Document
          file={book.fileUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={
            <div className="text-center">
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            className="shadow-elegant rounded-lg overflow-hidden"
          />
        </Document>
      </div>

      {/* Bottom Controls */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t transition-transform",
          !showControls && "translate-y-full"
        )}
      >
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1">
              <Slider
                value={[currentPage]}
                onValueChange={(value) => setCurrentPage(value[0])}
                max={numPages}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Page {currentPage}</span>
            <span>{Math.round((currentPage / numPages) * 100)}%</span>
            <span>{numPages} pages</span>
          </div>
        </div>
      </div>
    </div>
  );
}
