import { ProvenanceGraph } from '@visdesignlab/trrack';
import { observer } from 'mobx-react';

export type BookmarkToggleConfig<T, S extends string> = {
  graph?: ProvenanceGraph<T, S>;
  bookmarkView: boolean;
  // eslint-disable-next-line no-unused-vars
  setBookmarkView: (b: boolean) => void;
};

function BookmarkToggle<T, S extends string>({
  graph,
  bookmarkView,
  setBookmarkView,
}: BookmarkToggleConfig<T, S>) {
  if (graph === undefined) {
    return null;
  }

  return (
    <div className="custom-control custom-switch">
      <input
        checked={bookmarkView}
        className="custom-control-input"
        id="customSwitches"
        type="checkbox"
        readOnly
        onChange={() => {
          setBookmarkView(!bookmarkView);
        }}
      />
      <label className="custom-control-label" htmlFor="customSwitches">
        Show bookmarked
      </label>
    </div>
  );
}

export default observer(BookmarkToggle);
