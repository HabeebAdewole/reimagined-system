export function ActionBar() {
  return (
    <div className="flex gap-4 my-4">
      <button className="px-4 py-2 border border-white/20 rounded hover:bg-white/10 transition-colors">
        Download SVG
      </button>
      <button className="px-4 py-2 border border-white/20 rounded hover:bg-white/10 transition-colors">
        Share
      </button>
    </div>
  );
}
