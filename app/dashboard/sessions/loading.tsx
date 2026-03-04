export default function SessionsLoading() {
  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-6 gap-4'>
        <div className='h-6 bg-muted animate-pulse rounded' />
        <div className='h-6 bg-muted animate-pulse rounded' />
        <div className='h-6 bg-muted animate-pulse rounded' />
        <div className='h-6 bg-muted animate-pulse rounded' />
        <div className='h-6 bg-muted animate-pulse rounded' />
        <div className='h-6 bg-muted animate-pulse rounded' />
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className='grid grid-cols-6 gap-4'>
          <div className='h-8 bg-muted animate-pulse rounded' />
          <div className='h-8 bg-muted animate-pulse rounded' />
          <div className='h-8 bg-muted animate-pulse rounded' />
          <div className='h-8 bg-muted animate-pulse rounded' />
          <div className='h-8 bg-muted animate-pulse rounded' />
          <div className='h-8 bg-muted animate-pulse rounded' />
        </div>
      ))}
    </div>
  );
}
