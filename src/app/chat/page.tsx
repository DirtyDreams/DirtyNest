'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-auto py-4 space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-foreground">
              A
            </div>
            <div className="flex-1">
              <div className="bg-background-card p-4 rounded-lg border border-border max-w-2xl">
                <p className="text-foreground">Hello! How can I help you today?</p>
              </div>
              <span className="text-xs text-foreground-muted mt-1 ml-2">2 min ago</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 justify-end">
            <div className="flex-1 flex flex-col items-end">
              <div className="bg-primary-subtle p-4 rounded-lg border border-border max-w-2xl">
                <p className="text-primary">Can you help me with some code review?</p>
              </div>
              <span className="text-xs text-foreground-muted mt-1 mr-2">1 min ago</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-subtle flex items-center justify-center text-primary">
              U
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-foreground">
              A
            </div>
            <div className="flex-1">
              <div className="bg-background-card p-4 rounded-lg border border-border max-w-2xl">
                <p className="text-foreground">Of course! Please share your code and I'll help you review it.</p>
              </div>
              <span className="text-xs text-foreground-muted mt-1 ml-2">Just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border-subtle">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-3 bg-background-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
          />
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button className="p-2 text-primary hover:text-primary-light">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.172 7L8.5 7M8.5 7L11.586 4M8.5 7L11.586 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="p-2 text-emerald-400 hover:text-emerald-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary-dark">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}