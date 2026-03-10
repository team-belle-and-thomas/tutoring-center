import { DM_Sans, Playfair_Display } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const playfair = Playfair_Display({ style: 'italic', subsets: ['latin'] });
const dm_sans = DM_Sans({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className='pl-6 md:pl-20 pt-10 pr-6 md:pr-20 select-none'>
      <div className={'header mb-12 md:mb-16 border-b border-b-gray-400 flex items-center justify-between'}>
        <h3 className={`${playfair.className} text-2xl uppercase text-primary tracking-widest font-extrabold`}>
          Momentum Learning
        </h3>
        <Link
          href="/about"
          className={`${dm_sans.className} text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors`}
        >
          About
        </Link>
      </div>
      <div className='flex flex-col lg:flex-row gap-12 lg:gap-20 items-start'>
        <div className={`${dm_sans.className} hero w-full lg:w-1/2 flex flex-col gap-y-8`}>
          <div className='border-3 bg-primary border-primary w-1/10' />
          <h1
            className={`${playfair.className} text-4xl md:text-6xl lg:text-5xl xl:text-[4.5rem] leading-tight font-extrabold wrap-break-word`}
          >
            Where Learning Becomes <span className='text-primary'>Art</span>
          </h1>
          <p className='line-clamp-6 md:line-clamp-5 text-xl md:text-2xl md:w-3/4 text-gray-800'>
            Every student&apos;s journey is unique. Paint your path to success with personalized tracking, expert tutors
            and insights that matter.
          </p>
          <Button asChild className='rounded-none text-2xl w-fit font-bold py-8 px-10' size='lg'>
            <Link href="/login" draggable={false}>
              <span className='border-b-2 border-b-white flex items-center gap-2'>
                Enter Your Portal
                <ArrowRight className='size-5' strokeWidth={3} />
              </span>
            </Link>
          </Button>
        </div>
        <div className='w-full lg:w-1/2 relative'>
          <div className='relative w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-lg shadow-lg'>
            <Image src='/images/hero.jpg' alt='Happy student studying' fill className='object-cover' priority />
          </div>
        </div>
      </div>
    </main>
  );
}
