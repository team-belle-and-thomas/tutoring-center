'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SubjectOption, type SubjectSelection } from '@/lib/data/subjects';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PickSubjectProps = {
  subjects: SubjectOption[];
  studentFirstName?: string;
  onSelectAction: (selection: SubjectSelection) => void;
  onBackAction: () => void;
};

const backButtonClassName = 'w-fit rounded-2xl hover:border-primary/50 hover:ring-2 hover:ring-primary/10';
const subjectButtonClassName =
  'h-auto w-full justify-between rounded-2xl bg-muted p-4 text-left hover:border-primary/50 hover:bg-muted/60 hover:ring-2 hover:ring-primary/10';

export function PickSubject({ subjects, studentFirstName, onSelectAction, onBackAction }: PickSubjectProps) {
  const titleName = studentFirstName?.trim() || 'your child';

  return (
    <main className='mx-auto w-full max-w-3xl space-y-6 p-6'>
      <Card className='w-full'>
        <CardHeader className='space-y-3'>
          <Button className={backButtonClassName} size='sm' variant='ghost' onClick={onBackAction} type='button'>
            <ChevronLeft className='size-4' />
            Back
          </Button>
          <CardTitle className='text-2xl font-bold'>What subject does {titleName} need help with?</CardTitle>
          <CardDescription>Select one to get started.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {subjects.map(subject => (
            <Button
              key={subject.key}
              variant='outline'
              className={subjectButtonClassName}
              onClick={() =>
                onSelectAction({
                  subject: { key: subject.key, category: subject.category },
                  assignments: subject.assignments,
                })
              }
              type='button'
            >
              <span className='text-primary font-semibold'>{subject.category}</span>
              <span className='flex items-center gap-2'>
                <Badge>
                  {subject.tutorCount} {subject.tutorCount === 1 ? 'tutor' : 'tutors'}
                </Badge>
                <ChevronRight className='size-4 text-muted-foreground' />
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
