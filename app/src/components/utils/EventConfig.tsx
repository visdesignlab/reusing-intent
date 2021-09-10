import { EventConfig } from '../../library/trrack-vis/Utils/EventConfig';
import {
  AddBrush,
  ChangeBrush,
  Filter,
  Invert,
  PointDeselection,
  PointSelection,
  RemoveBrush,
  TurnPrediction,
} from '../../library/trrack-vis/Utils/Icons';
import { ReapplyEvents } from '../../stores/types/Provenance';

export const eventConfig: EventConfig<ReapplyEvents> = {
  'Point Selection': {
    backboneGlyph: <PointSelection size={22} />,
    currentGlyph: <PointSelection fill="#2185d0" size={22} />,
    regularGlyph: <PointSelection size={16} />,
    bundleGlyph: <PointSelection fill="#2185d0" size={22} />,
  },
  'Point Deselection': {
    backboneGlyph: <PointDeselection size={22} />,
    currentGlyph: <PointDeselection fill="#2185d0" size={22} />,
    regularGlyph: <PointDeselection size={16} />,
    bundleGlyph: <PointDeselection fill="#2185d0" size={22} />,
  },
  'Add Brush': {
    backboneGlyph: <AddBrush size={22} />,
    currentGlyph: <AddBrush fill="#2185d0" size={22} />,
    regularGlyph: <AddBrush size={16} />,
    bundleGlyph: <AddBrush fill="#2185d0" size={22} />,
  },
  'Algorithmic Selection': {
    backboneGlyph: <TurnPrediction size={22} />,
    currentGlyph: <TurnPrediction fill="#2185d0" size={22} />,
    regularGlyph: <TurnPrediction size={16} />,
    bundleGlyph: <TurnPrediction fill="#2185d0" size={22} />,
  },
  Invert: {
    backboneGlyph: <Invert size={22} />,
    currentGlyph: <Invert fill="#2185d0" size={22} />,
    regularGlyph: <Invert size={16} />,
    bundleGlyph: <Invert fill="#2185d0" size={22} />,
  },
  'Update Brush': {
    backboneGlyph: <ChangeBrush size={22} />,
    currentGlyph: <ChangeBrush fill="#2185d0" size={22} />,
    regularGlyph: <ChangeBrush size={16} />,
    bundleGlyph: <ChangeBrush fill="#2185d0" size={22} />,
  },
  'Remove Brush': {
    backboneGlyph: <RemoveBrush size={22} />,
    currentGlyph: <RemoveBrush fill="#2185d0" size={22} />,
    regularGlyph: <RemoveBrush size={16} />,
    bundleGlyph: <RemoveBrush fill="#2185d0" size={22} />,
  },
  Filter: {
    backboneGlyph: <Filter size={22} />,
    currentGlyph: <Filter fill="#2185d0" size={22} />,
    regularGlyph: <Filter size={16} />,
    bundleGlyph: <Filter fill="#ccc" size={22} />,
  },
};
