export type Bundle = {
  metadata: any;
  bundleLabel: string;
  bunchedNodes: string[];
};

export type BundleMap = { [key: string]: Bundle };

export type Source = {
  createdIn: string;
  approvedIn: string[];
}

export type OriginMap = { [key: string]: Source };
