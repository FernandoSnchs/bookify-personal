import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  StickyNote,
  Highlighter,
  Trash2,
  Edit,
  BookmarkIcon,
} from "lucide-react";
import { Annotation, Highlight, Bookmark } from "@/lib/db";
import { cn } from "@/lib/utils";

interface AnnotationsPanelProps {
  annotations: Annotation[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  onAddAnnotation: (text: string, note: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onDeleteHighlight: (id: string) => void;
  onDeleteBookmark: (id: string) => void;
  onNavigateToPage: (page: number) => void;
}

export const AnnotationsPanel = ({
  annotations,
  highlights,
  bookmarks,
  onAddAnnotation,
  onDeleteAnnotation,
  onDeleteHighlight,
  onDeleteBookmark,
  onNavigateToPage,
}: AnnotationsPanelProps) => {
  const [newNote, setNewNote] = useState("");

  return (
    <div className="h-full flex flex-col bg-card border-l">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Notes & Highlights</h3>
      </div>

      <Tabs defaultValue="highlights" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="highlights" className="gap-2">
            <Highlighter className="h-4 w-4" />
            Highlights ({highlights.length})
          </TabsTrigger>
          <TabsTrigger value="annotations" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Notes ({annotations.length})
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="gap-2">
            <BookmarkIcon className="h-4 w-4" />
            Bookmarks ({bookmarks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="highlights" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {highlights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No highlights yet
                </p>
              ) : (
                highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="group p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onNavigateToPage(highlight.page)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Page {highlight.page}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHighlight(highlight.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p
                      className={cn(
                        "text-sm line-clamp-3",
                        `highlight-${highlight.color}`
                      )}
                    >
                      {highlight.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="annotations" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {annotations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notes yet
                </p>
              ) : (
                annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="group p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onNavigateToPage(annotation.page)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Page {annotation.page}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnnotation(annotation.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {annotation.text && (
                      <p className="text-sm text-muted-foreground italic mb-2 line-clamp-2">
                        "{annotation.text}"
                      </p>
                    )}
                    <p className="text-sm">{annotation.note}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="bookmarks" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No bookmarks yet
                </p>
              ) : (
                bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onNavigateToPage(bookmark.page)}
                  >
                    <div className="flex items-center gap-3">
                      <BookmarkIcon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Page {bookmark.page}</p>
                        {bookmark.note && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {bookmark.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBookmark(bookmark.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
