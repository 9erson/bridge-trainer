// ============================================================
// DisplayModeToggle — switch between text and graphic card views
// ============================================================

import { Button } from '@/components/ui/button';
import { Eye, Type } from 'lucide-react';

interface DisplayModeToggleProps {
  mode: 'text' | 'graphic';
  onChange: (mode: 'text' | 'graphic') => void;
}

export default function DisplayModeToggle({ mode, onChange }: DisplayModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
      <Button
        variant={mode === 'text' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onChange('text')}
      >
        <Type className="w-3.5 h-3.5 mr-1" />
        Text
      </Button>
      <Button
        variant={mode === 'graphic' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onChange('graphic')}
      >
        <Eye className="w-3.5 h-3.5 mr-1" />
        Cards
      </Button>
    </div>
  );
}
