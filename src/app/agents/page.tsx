export default function AgentsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">AI Agents</h1>
            <p className="text-gray-400">Manage and deploy AI agents</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Create Agent
          </button>
        </div>

        <div className="space-y-4">
          {[
            {
              name: 'Code Assistant',
              description: 'Helps with code review, debugging, and optimization',
              status: 'Active',
              type: 'Development',
              lastActive: '2 minutes ago'
            },
            {
              name: 'Data Analyst',
              description: 'Analyzes data and generates insights',
              status: 'Idle',
              type: 'Analytics',
              lastActive: '1 hour ago'
            },
            {
              name: 'Content Writer',
              description: 'Generates and edits content with specific tone',
              status: 'Active',
              type: 'Content',
              lastActive: '5 minutes ago'
            },
            {
              name: 'Research Assistant',
              description: 'Helps with research and information gathering',
              status: 'Maintenance',
              type: 'Research',
              lastActive: '1 day ago'
            }
          ].map((agent, index) => (
            <div 
              key={index}
              className="p-6 bg-[#0F1F1B] rounded-lg border border-emerald-900/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium">{agent.name}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      agent.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                      agent.status === 'Idle' ? 'bg-emerald-600/10 text-emerald-300' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">{agent.description}</p>
                </div>
                <button className="text-emerald-400 hover:text-emerald-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12V12.01M8 12V12.01M16 12V12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Type: {agent.type}</span>
                  <span>Last active: {agent.lastActive}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="text-emerald-400 hover:text-emerald-300">Configure</button>
                  <button className="text-emerald-400 hover:text-emerald-300">Deploy</button>
                  <button className="text-emerald-400 hover:text-emerald-300">View Logs</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}