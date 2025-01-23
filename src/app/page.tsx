import DashboardCard from '@/components/ui/dashboard-card';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Welcome back</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <DashboardCard title="Recent Chats" description="Continue your conversations">
            <div className="space-y-2">
              <div className="p-3 bg-primary-subtle rounded-lg hover:bg-background-hover transition-colors cursor-pointer">
                <p className="text-sm">AI Assistant Chat</p>
                <p className="text-xs text-foreground-muted">2 minutes ago</p>
              </div>
              <div className="p-3 bg-primary-subtle rounded-lg hover:bg-background-hover transition-colors cursor-pointer">
                <p className="text-sm">Project Discussion</p>
                <p className="text-xs text-foreground-muted">1 hour ago</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Quick Tools" description="Frequently used features">
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-primary-subtle rounded-lg text-sm hover:bg-background-hover transition-colors text-primary">
                New Chat
              </button>
              <button className="p-3 bg-primary-subtle rounded-lg text-sm hover:bg-background-hover transition-colors text-primary">
                Upload File
              </button>
              <button className="p-3 bg-primary-subtle rounded-lg text-sm hover:bg-background-hover transition-colors text-primary">
                Draw
              </button>
              <button className="p-3 bg-primary-subtle rounded-lg text-sm hover:bg-background-hover transition-colors text-primary">
                Magic Tools
              </button>
            </div>
          </DashboardCard>

          <DashboardCard title="System Status" description="Current system metrics">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">API Status</span>
                <span className="text-sm text-primary">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm text-primary">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm text-primary">2.1 GB</span>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <DashboardCard title="Recent Documents" description="Recently accessed files">
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-primary-subtle rounded-lg hover:bg-background-hover transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm">Document {item}.pdf</span>
                  </div>
                  <span className="text-xs text-foreground-muted">Today</span>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Activity Feed" description="Recent system activities">
            <div className="space-y-4">
              {[
                { action: 'Created new chat', time: '2 minutes ago' },
                { action: 'Uploaded document', time: '1 hour ago' },
                { action: 'Started whiteboard session', time: '3 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between hover:text-primary transition-colors cursor-pointer">
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}