'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitProgressReport } from '@/lib/actions/session-progress';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProgressReportFormProps {
  sessionId: number;
  studentName: string;
  subjectName: string;
  scheduledAt: string;
}

export function ProgressReportForm({ sessionId, studentName, subjectName, scheduledAt }: ProgressReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const topics = formData.get('topics') as string;
    const homeworkAssigned = formData.get('homeworkAssigned') as string;
    const publicNotes = formData.get('publicNotes') as string;
    const internalNotes = formData.get('internalNotes') as string;

    if (!topics?.trim()) {
      setError('Topics Covered is required');
      setIsSubmitting(false);
      return;
    }

    if (!homeworkAssigned?.trim()) {
      setError('Homework Assigned is required');
      setIsSubmitting(false);
      return;
    }

    if (!publicNotes?.trim()) {
      setError('Public Notes is required');
      setIsSubmitting(false);
      return;
    }

    if (!internalNotes?.trim()) {
      setError('Internal Notes is required');
      setIsSubmitting(false);
      return;
    }

    try {
      await submitProgressReport({
        sessionId,
        topics,
        homeworkAssigned,
        publicNotes,
        internalNotes,
      });
      toast.success('Progress Report submitted!');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='space-y-4'>
      <Button variant='ghost' size='sm' onClick={() => router.push('/dashboard')}>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Pending Sessions
      </Button>

      <Card className='w-full max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>Progress Report</CardTitle>
          <p className='text-sm text-muted-foreground'>
            {studentName} - {subjectName}
          </p>
          <p className='text-sm text-muted-foreground'>
            {new Date(scheduledAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg'>{error}</div>
          )}

          <form action={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='topics'>
                Topics Covered <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='topics'
                name='topics'
                placeholder='e.g., Quadratic equations, Factoring polynomials'
                rows={3}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='homeworkAssigned'>
                Homework Assigned <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='homeworkAssigned'
                name='homeworkAssigned'
                placeholder='e.g., Complete problems 1-20 on page 45'
                rows={3}
                required
              />
            </div>

            <div className='space-y-4'>
              <Label>Notes</Label>
              <div className='grid gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='publicNotes' className='text-sm font-normal'>
                    Public Notes (visible to parents) <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea id='publicNotes' name='publicNotes' placeholder='Notes for parents' rows={3} required />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='internalNotes' className='text-sm font-normal'>
                    Internal Notes (tutors only) <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea
                    id='internalNotes'
                    name='internalNotes'
                    placeholder='Internal notes for tutors'
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Submit Progress Report'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
