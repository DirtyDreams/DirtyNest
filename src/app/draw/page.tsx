export default function DrawPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Draw</h1>
      <p className="text-gray-400">Create sketches and drawings</p>
      <div className="mt-4 p-8 border-2 border-dashed border-gray-700 rounded-lg">
        <p className="text-gray-500">Drawing canvas area</p>
      </div>
    </div>
  );
}