export default function MagicPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Magic Tools</h1>
      <p className="text-gray-400">AI-powered features and enhancements</p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Image Generation</h2>
          <p className="text-gray-400">Create images with AI</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Text Enhancement</h2>
          <p className="text-gray-400">Improve your writing</p>
        </div>
      </div>
    </div>
  );
}