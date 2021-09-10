import { SymbolType } from 'd3';
import { createContext } from 'react';

import { AggregateBy } from './../types/Interactions';

export type AggMap = { [column: string]: AggregateBy };

type GlobalPlotAttributes = {
  showCategory: boolean;
  labelMap: { [k: string]: string };
  selectedCategoryColumn: string | null;
  categoryMap: { [key: string]: SymbolType };
  hoveredCategory: string | null;
  setHoveredCategory: (cat: string | null) => void;
  aggregateOptions: AggMap | null;
  setAggregateOptions: (agg: AggMap) => void;
};

export const GlobalPlotAttributeContext = createContext<GlobalPlotAttributes | null>(null);
