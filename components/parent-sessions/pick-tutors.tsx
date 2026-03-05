import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SelectedSubject, type SubjectTutorAssignment } from '@/lib/data/subjects';
import { ChevronLeft } from 'lucide-react';

export type TutorOption = {
  id: number;
  user_id: number;
  name: string;
  education: string | null;
  years_experience: number | null;
  typicalAvailability: string | null;
};

type PickTutorProps = {
  subject: SelectedSubject;
  assignments: SubjectTutorAssignment[];
  tutors: TutorOption[];
  onSelect: (selection: { tutor: TutorOption; subjectId: number }) => void;
  onBack: () => void;
};

export function PickTutor({ subject, assignments, tutors, onSelect, onBack }: PickTutorProps) {
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
            <Button
              key={tutor.id}
              variant='outline'
              className='h-auto w-full justify-between rounded-2xl bg-muted p-4 text-left hover:border-primary/50 hover:bg-muted/60 hover:ring-2 hover:ring-primary/10'
              onClick={() => {
                const subjectId = assignments.find(assignment => assignment.tutorId === tutor.id)?.subjectId;
                if (!subjectId) return;
                onSelect({ tutor, subjectId });
              }}
              type='button'
            >
              <div className='space-y-1'>
                <p className='text-primary font-semibold'>{tutor.name}</p>
                {tutor.education || tutor.years_experience !== null ? (
                  <div className='flex items-center justify-between gap-3 text-sm text-muted-foreground'>
                    <span className='truncate'>{tutor.education ?? 'Education not listed'}</span>
                    <span className='shrink-0'>
                      {tutor.years_experience !== null
                        ? `${tutor.years_experience} ${tutor.years_experience === 1 ? 'year' : 'years'}`
                        : 'Experience n/a'}
                    </span>
                  </div>
                ) : null}
                {tutor.typicalAvailability ? (
                  <p className='text-xs text-muted-foreground'>Typical availability: {tutor.typicalAvailability}</p>
                ) : null}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
