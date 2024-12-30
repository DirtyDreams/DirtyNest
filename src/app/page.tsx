export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Welcome back</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0F1F1B] rounded-lg p-6 border border-emerald-900/30">
            <h3 className="text-lg font-medium mb-2">Recent Chats</h3>
            <p className="text-gray-400 text-sm mb-4">Continue your conversations</p>
            <div className="space-y-2">
              <div className="p-3 bg-emerald-600/10 rounded-lg hover:bg-[#132420] transition-colors cursor-pointer">
                <p className="text-sm">AI Assistant Chat</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
              <div className="p-3 bg-emerald-600/10 rounded-lg hover:bg-[#132420] transition-colors cursor-pointer">
                <p className="text-sm">Project Discussion</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1F1B] rounded-lg p-6 border border-emerald-900/30">
            <h3 className="text-lg font-medium mb-2">Quick Tools</h3>
            <p className="text-gray-400 text-sm mb-4">Frequently used features</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-emerald-600/10 rounded-lg text-sm hover:bg-[#132420] transition-colors text-emerald-400">
                New Chat
              </button>
              <button className="p-3 bg-emerald-600/10 rounded-lg text-sm hover:bg-[#132420] transition-colors text-emerald-400">
                Upload File
              </button>
              <button className="p-3 bg-emerald-600/10 rounded-lg text-sm hover:bg-[#132420] transition-colors text-emerald-400">
                Draw
              </button>
              <button className="p-3 bg-emerald-600/10 rounded-lg text-sm hover:bg-[#132420] transition-colors text-emerald-400">
                Magic Tools
              </button>
            </div>
          </div>

          <div className="bg-[#0F1F1B] rounded-lg p-6 border border-emerald-900/30">
            <h3 className="text-lg font-medium mb-2">System Status</h3>
            <p className="text-gray-400 text-sm mb-4">Current system metrics</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">API Status</span>
                <span className="text-sm text-emerald-400">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm text-emerald-400">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm text-emerald-400">2.1 GB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#0F1F1B] rounded-lg p-6 border border-emerald-900/30">
            <h3 className="text-lg font-medium mb-2">Recent Documents</h3>
            <p className="text-gray-400 text-sm mb-4">Recently accessed files</p>
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-emerald-600/10 rounded-lg hover:bg-[#132420] transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm">Document {item}.pdf</span>
                  </div>
                  <span className="text-xs text-gray-400">Today</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F1F1B] rounded-lg p-6 border border-emerald-900/30">
            <h3 className="text-lg font-medium mb-2">Activity Feed</h3>
            <p className="text-gray-400 text-sm mb-4">Recent system activities</p>
            <div className="space-y-4">
              {[
                { action: 'Created new chat', time: '2 minutes ago' },
                { action: 'Uploaded document', time: '1 hour ago' },
                { action: 'Started whiteboard session', time: '3 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between hover:text-emerald-400 transition-colors cursor-pointer">
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}