import {
  selectTutorsForSubject,
  shouldBlockForCredits,
  shouldStartAtSubjectStep,
} from '@/components/parent-sessions/booking-flow';
import { describe, expect, it } from 'vitest';

describe('booking-flow helpers', () => {
  it('starts at subject step when there is exactly one student', () => {
    expect(shouldStartAtSubjectStep([{ id: 1, name: 'Leia Organa', grade: '8' }])).toBe(true);
    expect(
      shouldStartAtSubjectStep([
        { id: 1, name: 'Luke Skywalker', grade: '8' },
        { id: 2, name: 'Leia Organa', grade: '8' },
      ])
    ).toBe(false);
  });

  it('returns only tutors present in the subject assignments', () => {
    const tutors = [
      { id: 10, user_id: 101, name: 'A Tutor', education: null, years_experience: 3, typicalAvailability: null },
      { id: 20, user_id: 102, name: 'B Tutor', education: null, years_experience: 5, typicalAvailability: null },
      { id: 30, user_id: 103, name: 'C Tutor', education: null, years_experience: 7, typicalAvailability: null },
    ];

    const result = selectTutorsForSubject(tutors, {
      assignments: [{ tutorId: 20 }, { tutorId: 30 }],
    });

    expect(result.map(tutor => tutor.id)).toEqual([20, 30]);
  });

  it('blocks booking when available credits are zero', () => {
    expect(shouldBlockForCredits(0)).toBe(true);
    expect(shouldBlockForCredits(1)).toBe(false);
  });
});
