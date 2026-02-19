import { DM_Sans, Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const playfair = Playfair_Display({ style: 'italic' });
const dm_sans = DM_Sans();

export default function Home() {
  return (
    <main className='pl-6 md:pl-20 pt-10 select-none'>
      <div className={'header mb-20 border-b border-b-gray-400'}>
        <h3 className={`${playfair.className} text-2xl uppercase text-primary mb-5 tracking-widest font-extrabold`}>
          Momentum Learning
        </h3>
      </div>
      <div className={`${dm_sans.className} hero w-full md:w-3/4 lg:w-1/2 flex flex-col gap-y-8 `}>
        <div className='border-3 bg-primary border-primary w-1/10' />
        <h1 className='text-4xl md:text-6xl lg:text-[5em] leading-tight font-extrabold wrap-break-word'>
          Where Learning Becomes <span className='text-primary'>Art</span>
        </h1>
        <p className='line-clamp-6 md:line-clamp-5 text-xl md:text-2xl md:w-3/4 text-gray-800'>
          Every student&apos;s journey is unique. Paint your path to success with personalized tracking, expert tutors
          and insights that matter.
        </p>
        <Button asChild className='rounded-none text-2xl w-fit font-bold py-8 px-10' size='lg'>
          <Link href='/login' draggable={false}>
            <span className='border-b-2 border-b-white flex items-center gap-2'>
              Enter Your Portal
              <ArrowRight className='size-5' strokeWidth={3} />
            </span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
