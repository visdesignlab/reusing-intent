export type Bundle = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  bundleLabel: string;
  bunchedNodes: string[];
};

export type BundleMap = { [key: string]: Bundle };

export type Source = {
  createdIn: string;
  approvedIn: string[];
  rejectedIn: string[];
};

export type OriginMap = { [key: string]: Source };
