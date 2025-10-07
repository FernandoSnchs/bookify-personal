import { Book } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Star, Clock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookCardProps {
  book: Book;
  progress?: number;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

export const BookCard = ({
  book,
  progress = 0,
  onOpen,
  onToggleFavorite,
  onDelete,
}: BookCardProps) => {
  return (
    <Card className="group relative overflow-hidden book-card-hover cursor-pointer shadow-card">
      <div className="aspect-[2/3] relative overflow-hidden bg-muted" onClick={onOpen}>
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl font-bold text-primary/30">
              {book.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Star
              className={`h-4 w-4 ${
                book.isFavorite ? "fill-accent text-accent" : ""
              }`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Book
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-3" onClick={onOpen}>
        <h3 className="font-semibold line-clamp-2 text-sm mb-1">{book.title}</h3>
        {book.author && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {book.author}
          </p>
        )}
        
        {book.lastReadAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(book.lastReadAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
