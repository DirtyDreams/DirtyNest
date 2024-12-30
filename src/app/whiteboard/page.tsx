export default function WhiteboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Whiteboard</h1>
      <p className="text-gray-400">Collaborative drawing and diagramming</p>
      <div className="mt-8 w-full max-w-4xl h-[500px] bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Whiteboard Canvas</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create New Board
          </button>
        </div>
      </div>
    </div>
  );
}