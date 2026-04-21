export function PromptForm() {
  return (
    <div className="w-full max-w-md p-4 bg-white/5 rounded-lg border border-white/10 my-4">
      <h2 className="text-xl mb-4">Prompt Form</h2>
      <form className="flex flex-col gap-4">
        <textarea 
          className="w-full p-2 bg-transparent border border-white/20 rounded resize-none"
          placeholder="Describe the SVG you want to generate..."
          rows={4}
        />
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Generate
        </button>
      </form>
    </div>
  );
}
