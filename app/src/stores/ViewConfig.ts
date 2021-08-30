type Range = {
  [id: string]: {
    min: number;
    max: number;
  };
};

export type ViewConfig = {
  global: Range;
  raw: Range;
};
