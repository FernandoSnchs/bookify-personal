import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Type, Palette } from "lucide-react";

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  margin: number;
  onMarginChange: (margin: number) => void;
}

export const ReaderControls = ({
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  fontFamily,
  onFontFamilyChange,
  theme,
  onThemeChange,
  margin,
  onMarginChange,
}: ReaderControlsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={12}
              max={24}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={onFontFamilyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">Sans Serif (Inter)</SelectItem>
                <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                <SelectItem value="mono">Monospace (Courier)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Height</Label>
              <span className="text-sm text-muted-foreground">{lineHeight}</span>
            </div>
            <Slider
              value={[lineHeight]}
              onValueChange={(value) => onLineHeightChange(value[0])}
              min={1.2}
              max={2.2}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Margins</Label>
              <span className="text-sm text-muted-foreground">{margin}px</span>
            </div>
            <Slider
              value={[margin]}
              onValueChange={(value) => onMarginChange(value[0])}
              min={0}
              max={100}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Reading Theme
            </Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="sepia">Sepia</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="paper">Paper</SelectItem>
                <SelectItem value="night-blue">Night Blue</SelectItem>
                <SelectItem value="warm">Warm Tone</SelectItem>
                <SelectItem value="high-contrast">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
