export default function MagicPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Magic Tools</h1>
      <p className="text-foreground-muted">AI-powered features and enhancements</p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-6 bg-background-card rounded-lg">
          <h2 className="text-lg font-medium mb-2 text-foreground">Image Generation</h2>
          <p className="text-foreground-muted">Create images with AI</p>
        </div>
        <div className="p-6 bg-background-card rounded-lg">
          <h2 className="text-lg font-medium mb-2 text-foreground">Text Enhancement</h2>
          <p className="text-foreground-muted">Improve your writing</p>
        </div>
      </div>
    </div>
  );
}