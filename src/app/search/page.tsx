'use client';

import { useState } from 'react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col items-center justify-start h-full pt-20 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Anything</h1>
          <p className="text-foreground-muted">Get instant, AI-powered answers</p>
        </div>

        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask any question..."
              className="w-full px-6 py-4 bg-background-card border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-primary-subtle rounded-lg text-primary"
              aria-label="Search"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center space-x-2 mt-4">
            <button className="px-4 py-2 bg-primary-subtle hover:bg-primary-subtle/50 text-primary rounded-lg text-sm">
              Academic
            </button>
            <button className="px-4 py-2 bg-primary-subtle hover:bg-primary-subtle/50 text-primary rounded-lg text-sm">
              Writing
            </button>
            <button className="px-4 py-2 bg-primary-subtle hover:bg-primary-subtle/50 text-primary rounded-lg text-sm">
              Analysis
            </button>
            <button className="px-4 py-2 bg-primary-subtle hover:bg-primary-subtle/50 text-primary rounded-lg text-sm">
              Coding
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium mb-3">Recent Searches</h2>
          {[
            {
              query: "How does quantum computing work?",
              timestamp: "2 hours ago",
              category: "Science"
            },
            {
              query: "Best practices for React performance",
              timestamp: "Yesterday",
              category: "Programming"
            },
            {
              query: "Latest developments in AI",
              timestamp: "2 days ago",
              category: "Technology"
            }
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-background-card rounded-lg hover:bg-background-hover cursor-pointer transition-colors border border-border-subtle"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground mb-1">{item.query}</p>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-foreground-muted">{item.timestamp}</span>
                    <span className="text-sm px-2 py-1 bg-primary-subtle rounded-full text-primary">
                      {item.category}
                    </span>
                  </div>
                </div>
                <button className="text-primary hover:text-primary-light">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12V12.01M8 12V12.01M16 12V12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}