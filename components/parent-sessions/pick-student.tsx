import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export type StudentOption = {
  id: number;
  name: string;
  grade: string | null;
};

type PickStudentProps = {
  students: StudentOption[];
  onSelect: (studentId: StudentOption) => void;
  onBack: () => void;
};

const backButtonClassName = 'w-fit rounded-2xl gap-1 hover:border-primary/50 hover:ring-2 hover:ring-primary/10';
const studentButtonClassName =
  'h-auto w-full justify-between rounded-2xl bg-muted p-4 text-left hover:border-primary/50 hover:bg-muted/60 hover:ring-2 hover:ring-primary/10';

export function PickStudent({ students, onSelect, onBack }: PickStudentProps) {
  return (
    <main className='mx-auto w-full max-w-3xl space-y-6 p-6'>
      <Card className='w-full'>
        <CardHeader className='space-y-3'>
          <Button className={backButtonClassName} size='sm' variant='ghost' onClick={onBack} type='button'>
            <ChevronLeft className='size-4' />
            Back
          </Button>
          <CardTitle className='text-2xl font-bold'>Select a student to get started</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {students.map(student => (
            <Button
              key={student.id}
              variant='outline'
              className={studentButtonClassName}
              onClick={() => onSelect(student)}
              type='button'
            >
              <span className='text-primary font-semibold'>{student.name}</span>
              <span className='text-sm text-muted-foreground'>Grade: {student.grade ?? 'Grade not set'}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
