'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, Search, Library, Settings, FileText, Wand2, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Prompt Library', href: '/prompts', icon: Library },
  { name: 'Tools', href: '/tools', icon: Settings },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'AI Agents', href: '/agents', icon: Wand2 },
  { name: 'Secrets', href: '/secrets', icon: Key },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col flex-1 p-2">
        <div className="flex items-center justify-between p-2">
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight">DirtyNest</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                      isCollapsed ? 'justify-center p-2' : 'px-3 py-2'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </div>
  );
}