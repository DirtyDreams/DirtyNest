export default function PromptsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Prompt Library</h1>
            <p className="text-gray-400">Manage and organize your prompts</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            New Prompt
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            {
              title: 'Code Review Assistant',
              description: 'AI prompt for reviewing code and suggesting improvements',
              category: 'Development'
            },
            {
              title: 'Content Writer',
              description: 'Generate blog posts and articles with specific tone',
              category: 'Writing'
            },
            {
              title: 'Data Analyzer',
              description: 'Analyze datasets and provide insights',
              category: 'Data Science'
            }
          ].map((prompt, index) => (
            <div 
              key={index}
              className="p-6 bg-[#0F1F1B] rounded-lg hover:bg-[#132420] transition-colors border border-emerald-900/30"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">{prompt.title}</h3>
                  <span className="text-sm px-3 py-1 bg-emerald-600/10 rounded-full text-emerald-400">
                    {prompt.category}
                  </span>
                </div>
                <button className="text-emerald-400 hover:text-emerald-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12V12.01M8 12V12.01M16 12V12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-gray-400">{prompt.description}</p>
              <div className="mt-4 flex items-center space-x-4">
                <button className="text-sm text-emerald-400 hover:text-emerald-300">Edit</button>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">Use Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}