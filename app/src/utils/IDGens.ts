export function getPlotId(): string {
  return `plot${new Date().getTime().toString()}`;
}

export function getBrushId(): string {
  return `brush${new Date().getTime().toString()}`;
}

export function getAggregateID(): string {
  return `agg${new Date().getTime().toString()}`;
}

export function getWorkflowID(): string {
  return `workflow${new Date().getTime().toString()}`;
}
