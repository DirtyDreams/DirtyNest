export default function SecretsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">My Secrets</h1>
            <p className="text-gray-400">Securely manage your sensitive information</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Secret
          </button>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h3 className="text-red-500 font-medium">Security Notice</h3>
              <p className="text-red-500/80 text-sm">All secrets are encrypted and stored securely. Never share your secrets or access credentials.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              name: 'API Key',
              type: 'API Credentials',
              lastModified: '2 hours ago',
              environment: 'Production'
            },
            {
              name: 'Database Password',
              type: 'Database Credentials',
              lastModified: '1 day ago',
              environment: 'Development'
            },
            {
              name: 'OAuth Token',
              type: 'Authentication',
              lastModified: '5 days ago',
              environment: 'Staging'
            }
          ].map((secret, index) => (
            <div 
              key={index}
              className="p-6 bg-gray-800 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14V12M7 11.0001C7 8.79092 9.23858 7 12 7C14.7614 7 17 8.79092 17 11.0001C17 12.8731 15.2507 14.4376 13 14.8988M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="text-lg font-medium">{secret.name}</h3>
                    <span className="text-sm px-3 py-1 bg-gray-700 rounded-full text-gray-300">
                      {secret.environment}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">Type: {secret.type}</p>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12V12.01M8 12V12.01M16 12V12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last modified: {secret.lastModified}</span>
                <div className="flex items-center space-x-3">
                  <button className="text-blue-400 hover:text-blue-300">View</button>
                  <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}