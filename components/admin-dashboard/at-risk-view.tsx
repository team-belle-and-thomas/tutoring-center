import { SendMessageButton } from '@/components/send-message-button';
import { AT_RISK_THRESHOLD, type AtRiskParent } from '@/lib/data/admin-dashboard';

export function AtRiskView({ title, parents }: { title: string; parents: AtRiskParent[] }) {
  return (
    <>
      <h2 className='text-xl font-semibold mb-4'>
        {title} <span className='text-sm font-normal text-muted-foreground'>(below {AT_RISK_THRESHOLD} credits)</span>
      </h2>
      {parents.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No at-risk accounts.</p>
      ) : (
        <div className='rounded-md border border-zinc-400 overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-stone-300 border-b border-zinc-400'>
                <th className='px-4 py-2 text-left font-semibold tracking-wider'>Parent</th>
                <th className='px-4 py-2 text-left font-semibold tracking-wider'>Email</th>
                <th className='px-4 py-2 text-left font-semibold tracking-wider'>Credits</th>
                <th className='px-4 py-2 text-left font-semibold tracking-wider'>Contact</th>
              </tr>
            </thead>
            <tbody>
              {parents.map(parent => (
                <tr key={parent.parent_id} className='bg-sidebar border-t border-zinc-200'>
                  <td className='px-4 py-2'>{parent.name}</td>
                  <td className='px-4 py-2 text-muted-foreground'>{parent.email}</td>
                  <td className='px-4 py-2 font-semibold text-red-600'>{parent.amount_available}</td>
                  <td className='px-4 py-2'>
                    <SendMessageButton email={parent.email} label='Send Message' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
