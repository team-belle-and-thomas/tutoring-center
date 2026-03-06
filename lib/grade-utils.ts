const LETTER_GRADE_TO_NUMBER: Record<string, number> = {
  'A+': 97,
  A: 93,
  'A-': 90,
  'B+': 87,
  B: 83,
  'B-': 80,
  'C+': 77,
  C: 73,
  'C-': 70,
  'D+': 67,
  D: 63,
  'D-': 60,
  F: 50,
};

export function letterGradeToNumber(grade: string): number {
  return LETTER_GRADE_TO_NUMBER[grade] ?? 0;
}
