'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StudentForGradeForm, SubjectForGradeForm } from '@/lib/data/grades';
import { toast } from 'sonner';

type GradeFormProps = {
  students: StudentForGradeForm[];
  subjects: SubjectForGradeForm[];
};

export function GradeForm({ students, subjects }: GradeFormProps) {
  const [studentId, setStudentId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [grade, setGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedSubject = subjects.find(s => s.id.toString() === subjectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!studentId) {
      toast.error('Please select a student');
      return;
    }

    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }

    if (!grade) {
      toast.error('Please enter a grade');
      return;
    }

    const parsedGrade = parseFloat(grade);
    if (isNaN(parsedGrade)) {
      toast.error('Please enter a valid number');
      return;
    }

    if (parsedGrade < 0 || parsedGrade > 100) {
      toast.error('Grade must be between 0 and 100');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: parseInt(studentId, 10),
          subject: selectedSubject?.category ?? '',
          grade: parsedGrade,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save grade');
        return;
      }

      toast.success('Grade saved successfully!');
      setStudentId('');
      setSubjectId('');
      setGrade('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className='max-w-md'>
      <CardHeader>
        <CardTitle>Grade Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='student'>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger id='student'>
                <SelectValue placeholder='Select a student' />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='subject'>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id='subject'>
                <SelectValue placeholder='Select a subject' />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='grade'>Grade (%)</Label>
            <Input
              id='grade'
              type='number'
              min='0'
              max='100'
              step='1'
              placeholder='0-100'
              value={grade}
              onChange={e => setGrade(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>Enter a percentage between 0 and 100</p>
          </div>

          <Button className='w-full' disabled={isLoading} type='submit'>
            {isLoading ? 'Saving...' : 'Save Grade'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
