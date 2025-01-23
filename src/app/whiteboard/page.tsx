export default function WhiteboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Whiteboard</h1>
      <p className="text-foreground-muted">Collaborative drawing and diagramming</p>
      <div className="mt-8 w-full max-w-4xl h-[500px] bg-background-card rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">Whiteboard Canvas</p>
          <button className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary-dark">
            Create New Board
          </button>
        </div>
      </div>
    </div>
  );
}