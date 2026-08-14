
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ActivityItem {
  id: string;
  user: string;
  initials: string;
  action: string;
  target?: string;
  time: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'create' | 'comment' | 'complete' | 'update';
}

export interface ActivityFeedProps {
  title?: string;
  items?: ActivityItem[];
  className?: string;
}

const TYPE_DOT: Record<NonNullable<ActivityItem['type']>, string> = {
  default:  'bg-muted-foreground',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  error:    'bg-red-500',
  create:   'bg-blue-500',
  comment:  'bg-purple-500',
  complete: 'bg-emerald-500',
  update:   'bg-amber-500',
};

const DEFAULT_ITEMS: ActivityItem[] = [
  { id: '1', user: 'Sarah Chen',    initials: 'SC', action: 'created a new project',    target: 'Strategy Q3',     time: '2m ago',   type: 'success' },
  { id: '2', user: 'Marcus Lee',    initials: 'ML', action: 'commented on',             target: 'Budget Review',   time: '18m ago',  type: 'default' },
  { id: '3', user: 'Jordan Park',   initials: 'JP', action: 'completed task',           target: 'Stakeholder map', time: '1h ago',   type: 'success' },
  { id: '4', user: 'Elena Torres',  initials: 'ET', action: 'flagged issue in',         target: 'Client report',   time: '3h ago',   type: 'warning' },
  { id: '5', user: 'System',        initials: 'SY', action: 'deployment failed for',    target: 'v2.4.1',          time: '5h ago',   type: 'error'   },
  { id: '6', user: 'Sarah Chen',    initials: 'SC', action: 'uploaded document',        target: 'Final deck.pdf',  time: 'Yesterday',type: 'default' },
];

export function ActivityFeed({ title = 'Activity', items = DEFAULT_ITEMS, className }: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {items.map(item => (
            <li key={item.id} className="flex items-start gap-3 px-6 py-3">
              <div className="relative mt-0.5 shrink-0">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px]">{item.initials}</AvatarFallback>
                </Avatar>
                <span className={cn('absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background', TYPE_DOT[item.type ?? 'default'])} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{item.user}</span>
                  {' '}{item.action}
                  {item.target && <span className="font-medium"> {item.target}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
