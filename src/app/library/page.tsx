export default function LibraryPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Library</h1>
      <p className="text-gray-400">Access your saved content</p>
      <div className="mt-8 w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-medium">Saved Conversations</h3>
              <p className="text-sm text-gray-400">Your chat history and bookmarks</p>
            </div>
            <span className="text-gray-400">0 items</span>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-medium">Documents</h3>
              <p className="text-sm text-gray-400">Your uploaded and generated files</p>
            </div>
            <span className="text-gray-400">0 items</span>
          </div>
        </div>
      </div>
    </div>
  );
}