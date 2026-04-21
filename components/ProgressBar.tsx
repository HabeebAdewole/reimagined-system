export function ProgressBar() {
  return (
    <div className="w-full max-w-md p-4 my-2">
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-blue-500 h-2.5 rounded-full w-1/3"></div>
      </div>
      <p className="text-sm mt-2 text-center text-gray-400">Processing...</p>
    </div>
  );
}
