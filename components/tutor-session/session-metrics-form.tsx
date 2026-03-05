'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitSessionMetrics } from '@/lib/actions/session-metrics';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface SessionMetricsFormProps {
  sessionId: number;
  studentName: string;
  subjectName: string;
  scheduledAt: string;
}

function StarRatingInput({
  name,
  label,
  description,
  required,
  value,
  onChange,
  showError,
}: {
  name: string;
  label: string;
  description: string;
  required?: boolean;
  value: number;
  onChange: (val: number) => void;
  showError?: boolean;
}) {
  return (
    <div className='space-y-2'>
      <Label>
        {label} {required && <span className='text-red-500'>*</span>}
      </Label>
      <p className='text-sm text-muted-foreground'>{description}</p>
      <input type='hidden' name={name} value={value} />
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type='button'
            onClick={() => onChange(star)}
            className='p-1 hover:scale-110 transition-transform'
          >
            <Star size={32} className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          </button>
        ))}
      </div>
      {showError && required && value === 0 && <p className='text-sm text-red-500'>Please select a rating</p>}
    </div>
  );
}

export function SessionMetricsForm({ sessionId, studentName, subjectName, scheduledAt }: SessionMetricsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [sessionPerformance, setSessionPerformance] = useState(0);
  const [touched, setTouched] = useState(false);

  async function handleSubmit(formData: FormData) {
    setTouched(true);
    setIsSubmitting(true);
    setError(null);

    if (confidenceScore === 0) {
      setError('Please select a Confidence Score');
      setIsSubmitting(false);
      return;
    }

    if (sessionPerformance === 0) {
      setError('Please select a Session Performance rating');
      setIsSubmitting(false);
      return;
    }

    const tutorComments = formData.get('tutorComments') as string;
    if (!tutorComments?.trim()) {
      setError('Tutor Comments is required');
      setIsSubmitting(false);
      return;
    }

    const homeworkCompleted = formData.get('homeworkCompleted') === 'yes';

    try {
      await submitSessionMetrics({
        sessionId,
        confidenceScore,
        sessionPerformance,
        homeworkCompleted,
        tutorComments,
      });
      toast.success('Session Metrics submitted!');
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
          <CardTitle>Session Metrics</CardTitle>
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
            <StarRatingInput
              name='confidenceScore'
              label='Confidence Score'
              description='How confident does the student seem?'
              required
              value={confidenceScore}
              onChange={setConfidenceScore}
              showError={touched}
            />

            <StarRatingInput
              name='sessionPerformance'
              label='Session Performance'
              description='How well did the student perform?'
              required
              value={sessionPerformance}
              onChange={setSessionPerformance}
              showError={touched}
            />

            <div className='space-y-2'>
              <Label>Homework Completed</Label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2'>
                  <input type='radio' name='homeworkCompleted' value='yes' />
                  <span>Yes</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input type='radio' name='homeworkCompleted' value='no' defaultChecked />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tutorComments'>
                Tutor Comments <span className='text-red-500'>*</span>
              </Label>
              <Textarea id='tutorComments' name='tutorComments' placeholder='Additional comments' rows={3} required />
            </div>

            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Submit Session Metrics'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
