import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Bookmark as BookmarkIcon,
  ZoomIn,
  ZoomOut,
  PanelRight,
  Maximize2,
} from "lucide-react";
import {
  getBook,
  getProgress,
  saveProgress,
  getBookmarksByBook,
  addBookmark,
  deleteBookmark,
  getHighlightsByBook,
  getAnnotationsByBook,
  deleteHighlight,
  deleteAnnotation,
  Bookmark,
  Highlight,
  Annotation,
  Book,
  getStats,
  saveStats,
} from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReaderControls } from "@/components/ReaderControls";
import { AnnotationsPanel } from "@/components/AnnotationsPanel";
import { ReadingStatsBar } from "@/components/ReadingStatsBar";
import { motion, AnimatePresence } from "framer-motion";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const READING_THEMES: Record<string, string> = {
  light: "",
  dark: "dark",
  sepia: "theme-sepia",
  night: "theme-night",
  paper: "theme-paper",
  "night-blue": "theme-night-blue",
  warm: "theme-warm",
  "high-contrast": "theme-high-contrast",
};

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [theme, setTheme] = useState<string>("light");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  
  // Reading customization
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState("sans");
  const [margin, setMargin] = useState(40);
  
  // Stats
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState<number | undefined>();
  
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

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
        setTotalTimeSpent(progress.timeSpent || 0);
      }

      // Load bookmarks, highlights, and annotations
      const [bookmarkData, highlightData, annotationData, stats] = await Promise.all([
        getBookmarksByBook(bookId),
        getHighlightsByBook(bookId),
        getAnnotationsByBook(bookId),
        getStats(bookId),
      ]);
      
      setBookmarks(bookmarkData);
      setHighlights(highlightData);
      setAnnotations(annotationData);
      
      if (stats?.readingSpeed) {
        setReadingSpeed(stats.readingSpeed);
      }
    };

    loadBook();
    setStartTime(Date.now());
  }, [bookId, navigate]);

  useEffect(() => {
    if (!book || !numPages) return;

    const saveCurrentProgress = async () => {
      const sessionTime = Math.floor((Date.now() - startTime) / 1000);
      const newTotalTime = totalTimeSpent + sessionTime;
      
      await saveProgress({
        bookId: book.id,
        currentPage,
        totalPages: numPages,
        percentage: Math.round((currentPage / numPages) * 100),
        updatedAt: Date.now(),
        timeSpent: newTotalTime,
      });
      
      // Calculate and save reading speed
      if (currentPage > 1) {
        const speed = currentPage / (newTotalTime / 60); // pages per minute
        await saveStats({
          bookId: book.id,
          totalTimeSpent: newTotalTime,
          pagesRead: currentPage,
          lastReadAt: Date.now(),
          readingSpeed: speed,
        });
        setReadingSpeed(speed);
      }
      
      setStartTime(Date.now());
      setTotalTimeSpent(newTotalTime);
    };

    saveCurrentProgress();
  }, [currentPage, book, numPages]);
  
  // Auto-hide controls in immersive mode
  useEffect(() => {
    if (!immersiveMode) return;

    const resetTimeout = () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      setShowControls(true);
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimeout();
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [immersiveMode, currentPage]);

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

  const handleDeleteBookmark = async (id: string) => {
    await deleteBookmark(id);
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    toast.success("Bookmark removed");
  };

  const handleDeleteHighlight = async (id: string) => {
    await deleteHighlight(id);
    setHighlights(highlights.filter((h) => h.id !== id));
    toast.success("Highlight removed");
  };

  const handleDeleteAnnotation = async (id: string) => {
    await deleteAnnotation(id);
    setAnnotations(annotations.filter((a) => a.id !== id));
    toast.success("Note removed");
  };

  const isBookmarked = bookmarks.some((b) => b.page === currentPage);
  
  const estimatedTimeLeft = readingSpeed
    ? `${Math.ceil((numPages - currentPage) / readingSpeed)} min`
    : undefined;

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex", READING_THEMES[theme])}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Controls */}
        <AnimatePresence>
          {(!immersiveMode || showControls) && (
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b"
            >
              <div className="container flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
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
                  <span className="text-sm w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
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
                    <BookmarkIcon
                      className={cn("h-4 w-4", isBookmarked && "fill-current")}
                    />
                  </Button>

                  <ReaderControls
                    fontSize={fontSize}
                    onFontSizeChange={setFontSize}
                    lineHeight={lineHeight}
                    onLineHeightChange={setLineHeight}
                    fontFamily={fontFamily}
                    onFontFamilyChange={setFontFamily}
                    theme={theme}
                    onThemeChange={setTheme}
                    margin={margin}
                    onMarginChange={setMargin}
                  />

                  <Button
                    variant={immersiveMode ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setImmersiveMode(!immersiveMode)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant={showSidebar ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF Viewer */}
        <div
          className="flex-1 flex items-center justify-center pt-14 pb-20 px-4"
          onClick={() => immersiveMode && setShowControls(!showControls)}
          style={{
            paddingLeft: `${margin}px`,
            paddingRight: `${margin}px`,
          }}
        >
          <div
            className={cn(`font-${fontFamily}`)}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
            }}
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
        </div>

        {/* Bottom Controls */}
        <AnimatePresence>
          {(!immersiveMode || showControls) && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t"
            >
              <div className="container px-4 py-4">
                <div className="flex items-center gap-4 mb-3">
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

                <ReadingStatsBar
                  currentPage={currentPage}
                  totalPages={numPages}
                  estimatedTimeLeft={estimatedTimeLeft}
                  readingSpeed={readingSpeed}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-96 z-40"
          >
            <AnnotationsPanel
              annotations={annotations}
              highlights={highlights}
              bookmarks={bookmarks}
              onAddAnnotation={() => {}}
              onDeleteAnnotation={handleDeleteAnnotation}
              onDeleteHighlight={handleDeleteHighlight}
              onDeleteBookmark={handleDeleteBookmark}
              onNavigateToPage={(page) => setCurrentPage(page)}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
