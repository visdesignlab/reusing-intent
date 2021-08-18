function BookmarkToggle({ graph, bookmarkView, setBookmarkView }: any) {
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

export default BookmarkToggle;
