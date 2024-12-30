export default function HistoryPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">History</h1>
      <p className="text-gray-400">View your past activities and conversations</p>
      <div className="mt-8 w-full max-w-3xl">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div 
              key={item}
              className="p-4 bg-gray-800 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Conversation {item}</h3>
                <span className="text-sm text-gray-400">Today</span>
              </div>
              <p className="text-gray-400 text-sm">
                Last message: Example conversation content...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}