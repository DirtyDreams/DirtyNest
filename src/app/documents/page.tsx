export default function DocumentsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">Documents</h1>
      <p className="text-foreground-muted">Manage your files and documents</p>
      <div className="mt-8 w-full max-w-3xl">
        <div className="flex justify-end mb-4">
          <button className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary-dark">
            Upload Document
          </button>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 bg-background-card rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <h3 className="font-medium text-foreground">Document {item}.pdf</h3>
                  <p className="text-sm text-foreground-muted">Added today</p>
                </div>
              </div>
              <button className="text-foreground-muted hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12V12.01M8 12V12.01M16 12V12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}