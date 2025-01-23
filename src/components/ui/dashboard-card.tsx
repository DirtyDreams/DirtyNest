import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type DashboardCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function DashboardCard({
  title,
  description,
  children,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 transition-colors hover:bg-hover',
        className
      )}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}