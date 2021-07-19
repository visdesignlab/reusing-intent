import { SymbolType } from 'd3';
import { createContext } from 'react';

type Category = {
  showCategory: boolean;
  selectedCategoryColumn: string | null;
  categoryMap: { [key: string]: SymbolType };
};

export const CategoryContext = createContext<Category | null>(null);
