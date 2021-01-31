export type BrushID = string;

export type Brush = {
  id: string;
  extents: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

export type BrushCollection = { [key in BrushID]: Brush };

export type BrushAffectType = 'Add' | 'Remove' | 'Update' | 'Clear';
