import { BookOpen, Moon, Sun, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onAddBook: () => void;
  onSearch: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header = ({ onAddBook, onSearch, isDark, onToggleTheme }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Kindle Personal</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-9 bg-muted/50"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onAddBook}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Book</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};
