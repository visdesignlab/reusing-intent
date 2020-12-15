export function getPlotId(): string {
  return `plot${new Date().getTime().toString()}`;
}

export function getBrushId(): string {
  return `brush${new Date().getTime().toString()}`;
}
