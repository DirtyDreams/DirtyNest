export default function HistoryPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4 text-foreground">History</h1>
      <p className="text-foreground-muted">View your past activities and conversations</p>
      <div className="mt-8 w-full max-w-3xl">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 bg-background-card rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">Conversation {item}</h3>
                <span className="text-sm text-foreground-muted">Today</span>
              </div>
              <p className="text-foreground-muted text-sm">
                Last message: Example conversation content...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}