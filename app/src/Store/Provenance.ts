import { Prediction} from '../contract';

export type IntentEvents =
  | "Load Dataset"
  | "MultiBrush"
  | "Switch Category Visibility"
  | "Change Category"
  | "Add Plot"
  | "Point Selection"
  | "Point Deselection"
  | "Add Brush"
  | "Lock Prediction"
  | "Turn Prediction"
  | "Invert"
  | "Edit Brush"
  | "Remove Brush"
  | "Clear All"
  | "Change Selected Brush";

export type Predictions = Prediction[]