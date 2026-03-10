import Link from 'next/link';
import { CardTooltip } from '@/components/card-tooltip';
import type { Route } from 'next';

export function MetricCard({
  label,
  value,
  sub,
  subColor,
  href,
  active,
  tooltip,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  href: Route<string>;
  active: boolean;
  tooltip?: string;
}) {
  return (
    <Link href={href} className='block h-full'>
      <div
        className={`rounded-lg border p-4 flex flex-col transition-colors cursor-pointer h-full ${
          active
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
            : 'border-zinc-300 bg-sidebar hover:border-zinc-400'
        }`}
      >
        <div className='flex items-start justify-between'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground font-semibold'>{label}</p>
          {tooltip && <CardTooltip text={tooltip} />}
        </div>
        <p className='text-3xl font-bold mt-1'>{value}</p>
        {sub && <p className={`text-xs mt-auto pt-2 ${subColor ?? 'text-muted-foreground'}`}>{sub}</p>}
      </div>
    </Link>
  );
}
