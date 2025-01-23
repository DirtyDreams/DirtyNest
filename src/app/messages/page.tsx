'use client';

import { useState, type ReactNode } from 'react';

interface ChatMessage {
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export default function MessagesPage(): ReactNode {
  const [searchQuery, setSearchQuery] = useState('');

  const messages: ChatMessage[] = [
    {
      name: 'Code Review Discussion',
      lastMessage: "I've reviewed your code and have some suggestions...",
      time: '2 min ago',
      unread: true
    },
    {
      name: 'Project Planning',
      lastMessage: "Let's schedule a meeting to discuss the timeline.",
      time: '1 hour ago',
      unread: false
    },
    {
      name: 'Bug Report Analysis',
      lastMessage: 'I found the root cause of the issue...',
      time: '2 hours ago',
      unread: false
    }
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Messages</h1>
        <p className="text-foreground-muted">View your message history</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-full px-4 py-3 bg-background-card border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-auto space-y-3">
        {messages.map((chat, index) => (
          <div
            key={index}
            className="p-4 bg-background-card rounded-lg border border-border-subtle hover:bg-background-hover transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center text-primary">
                  {chat.name[0]}
                </div>
                <div>
                  <h3 className="font-medium flex items-center text-foreground">
                    {chat.name}
                    {chat.unread && (
                      <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </h3>
                  <p className="text-foreground-muted text-sm mt-1">{chat.lastMessage}</p>
                </div>
              </div>
              <span className="text-xs text-foreground-muted">{chat.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Message Button */}
      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary-dark flex items-center space-x-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>New Message</span>
        </button>
      </div>
    </div>
  );
}