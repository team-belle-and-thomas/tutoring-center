import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export type TutorOption = {
  id: number;
  user_id: number;
  firstName: string;
  lastName: string;
  education: string | null;
  years_experience: number | null;
};

type PickTutorProps = {
  subject: {
    id: number;
    category: string;
  };
  tutors: TutorOption[];
  onSelect: (tutor: TutorOption) => void;
  onBack: () => void;
};

export function PickTutor({ subject, tutors, onSelect, onBack }: PickTutorProps) {
  return (
    <main className='mx-auto w-full max-w-3xl space-y-6 p-6'>
      <Card className='w-full'>
        <CardHeader className='space-y-3'>
          <Button className='w-fit rounded-2xl gap-1' size='sm' variant='ghost' onClick={onBack} type='button'>
            <ChevronLeft className='size-4' />
            Back
          </Button>
          <CardTitle className='text-2xl font-bold'>Choose a tutor for {subject.category}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {tutors.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No tutors found for this subject.</p>
          ) : null}
          {tutors.map(tutor => (
            <button
              key={tutor.id}
              className='w-full rounded-2xl border bg-muted p-4 text-left transition-colors hover:bg-muted/80'
              onClick={() => onSelect(tutor)}
              type='button'
            >
              <p className='font-semibold'>
                {tutor.firstName} {tutor.lastName}
              </p>
              {tutor.education ? <p className='text-sm text-muted-foreground'>{tutor.education}</p> : null}
            </button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
