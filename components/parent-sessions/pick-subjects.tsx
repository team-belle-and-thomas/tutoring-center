import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export type SubjectOption = {
  id: number;
  category: string;
};

type PickSubjectProps = {
  subjects: SubjectOption[];
  onSelect: (category: SubjectOption) => void;
  onBack: () => void;
};

export function PickSubject({ subjects, onSelect, onBack }: PickSubjectProps) {
  return (
    <main className='mx-auto w-full max-w-3xl space-y-6 p-6'>
      <Card className='w-full'>
        <CardHeader className='space-y-3'>
          <Button className='w-fit rounded-2xl gap-1' size='sm' variant='ghost' onClick={onBack} type='button'>
            <ChevronLeft className='size-4' />
            Back
          </Button>
          <CardTitle className='text-2xl font-bold'>What subject does your child need help with?</CardTitle>
          <CardDescription>Select one to get started.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {subjects.map(subject => (
            <button
              key={subject.id}
              className='w-full rounded-2xl border bg-muted p-4 text-left font-semibold transition-colors hover:bg-muted/80'
              onClick={() => onSelect(subject)}
              type='button'
            >
              {subject.category}
            </button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
