import { SymbolType } from 'd3';
import { createContext } from 'react';

type Category = {
  showCategory: boolean;
  selectedCategoryColumn: string | null;
  categoryMap: { [key: string]: SymbolType };
  hoveredCategory: string | null;
  setHoveredCategory: (cat: string | null) => void;
};

export const CategoryContext = createContext<Category | null>(null);
