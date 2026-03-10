import { DM_Sans, Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const playfair = Playfair_Display({ style: 'italic', subsets: ['latin'] });
const dm_sans = DM_Sans({ subsets: ['latin'] });

export default function AboutPage() {
  return (
    <main className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors'
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className='mb-12'>
          <h1 className={`${playfair.className} text-4xl md:text-5xl font-extrabold text-primary mb-6`}>
            About Momentum Learning
          </h1>
          <p className={`${dm_sans.className} text-xl text-muted-foreground`}>Where Learning Becomes Art</p>
        </div>

        <div className='prose prose-lg max-w-none space-y-8'>
          <section className='mb-10'>
            <h2 className={`${playfair.className} text-2xl font-bold text-primary mb-4`}>Our Mission</h2>
            <p className={`${dm_sans.className} text-foreground leading-relaxed`}>
              At Momentum Learning, we believe every student has the potential to excel. Our personalized tutoring
              approach combines expert guidance with innovative progress tracking, ensuring parents can see real results
              in their child&apos;s academic journey.
            </p>
          </section>

          <section className='mb-10'>
            <h2 className={`${playfair.className} text-2xl font-bold text-primary mb-4`}>Why Choose Us</h2>
            <ul className={`${dm_sans.className} space-y-3`}>
              <li className='flex items-start gap-3'>
                <span className='text-primary font-bold'>•</span>
                <span>Expert tutors across multiple subjects and grade levels</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-primary font-bold'>•</span>
                <span>Real-time progress tracking with detailed insights</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-primary font-bold'>•</span>
                <span>Flexible credit-based system - pay only for what you use</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-primary font-bold'>•</span>
                <span>Seamless continuity between sessions with detailed notes</span>
              </li>
            </ul>
          </section>

          <section className='mb-10'>
            <h2 className={`${playfair.className} text-2xl font-bold text-primary mb-4`}>Did You Know?</h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-card p-6 rounded-lg shadow-sm border'>
                <p className={`${dm_sans.className} text-sm text-muted-foreground uppercase tracking-wide mb-2`}>
                  Founded
                </p>
                <p className={`${playfair.className} text-3xl font-bold text-primary`}>2019</p>
              </div>
              <div className='bg-card p-6 rounded-lg shadow-sm border'>
                <p className={`${dm_sans.className} text-sm text-muted-foreground uppercase tracking-wide mb-2`}>
                  Students Helped
                </p>
                <p className={`${playfair.className} text-3xl font-bold text-primary`}>2,500+</p>
              </div>
              <div className='bg-card p-6 rounded-lg shadow-sm border'>
                <p className={`${dm_sans.className} text-sm text-muted-foreground uppercase tracking-wide mb-2`}>
                  Tutor Network
                </p>
                <p className={`${playfair.className} text-3xl font-bold text-primary`}>150+</p>
              </div>
              <div className='bg-card p-6 rounded-lg shadow-sm border'>
                <p className={`${dm_sans.className} text-sm text-muted-foreground uppercase tracking-wide mb-2`}>
                  Satisfaction Rate
                </p>
                <p className={`${playfair.className} text-3xl font-bold text-primary`}>98%</p>
              </div>
            </div>
          </section>

          <section className='mb-10'>
            <h2 className={`${playfair.className} text-2xl font-bold text-primary mb-4`}>Our Approach</h2>
            <p className={`${dm_sans.className} text-foreground leading-relaxed mb-4`}>
              We pioneered the credit-based tutoring model, giving parents flexibility and control over their investment
              in their child&apos;s education. Unlike traditional tutoring centers that require long-term contracts,
              Momentum Learning allows you to purchase credit blocks and use them as needed.
            </p>
            <p className={`${dm_sans.className} text-foreground leading-relaxed`}>
              Our ROI dashboard helps you visualize progress, while session continuity notes ensure every tutor can pick
              up exactly where the last one left off.
            </p>
          </section>

          <section className='text-center pt-8 border-t'>
            <h2 className={`${playfair.className} text-2xl font-bold text-primary mb-4`}>
              Ready to Start Your Journey?
            </h2>
            <Button asChild className='rounded-none text-xl font-bold py-6 px-8' size='lg'>
              <Link href='/login'>Get Started Today</Link>
            </Button>
          </section>
        </div>
      </div>
      <footer className='border-t py-6 px-6 text-center text-sm text-muted-foreground'>
        © {new Date().getFullYear()} Momentum Learning. All rights reserved.
      </footer>
    </main>
  );
}
