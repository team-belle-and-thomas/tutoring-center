import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

type StudentOption = {
  id: number;
  firstName: string;
  lastName: string;
  grade: string | null;
};

type PickStudentProps = {
  students: StudentOption[];
  onSelect: (studentId: StudentOption) => void;
  onBack: () => void;
};

export function PickStudent({ students, onSelect, onBack }: PickStudentProps) {
  return (
    <main className='mx-auto w-full max-w-3xl space-y-6 p-6'>
      <Card className='w-full'>
        <CardHeader className='space-y-3'>
          <Button className='w-fit rounded-2xl gap-1' size='sm' variant='ghost' onClick={onBack} type='button'>
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
              className='w-full rounded-2xl border bg-muted p-6 text-left transition-colors hover:bg-muted/80 flex items-center justify-between'
              onClick={() => onSelect(student)}
            >
              <span className='mb-1 text-black font-semibold'>
                {student.firstName} {student.lastName}
              </span>
              <span className='text-sm text-muted-foreground'>Grade: {student.grade ?? 'Grade not set'}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
