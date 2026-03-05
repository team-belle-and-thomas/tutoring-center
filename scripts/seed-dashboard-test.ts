import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function deleteOldSeedData() {
  console.log('🗑️  Deleting old seed data...');

  const { data: sessionsToDelete, error: fetchError } = await supabase
    .from('sessions')
    .select('id')
    .eq('parent_id', 1)
    .in('status', ['Completed', 'Scheduled']);

  if (fetchError) {
    console.error('Error fetching sessions to delete:', fetchError);
    return;
  }

  const sessionIds = sessionsToDelete?.map(s => s.id) || [];

  if (sessionIds.length > 0) {
    await supabase.from('session_metrics').delete().in('session_id', sessionIds);
    await supabase.from('session_progress').delete().in('session_id', sessionIds);
    await supabase.from('sessions').delete().in('id', sessionIds);
  }

  console.log(`✅ Deleted ${sessionIds.length} old sessions`);
}

const subjects = [
  { id: 1, name: 'Math' },
  { id: 2, name: 'Reading' },
  { id: 3, name: 'Science' },
];

const studentSubjects = [
  { studentId: 1, subjectId: 1, type: 'happy' },
  { studentId: 1, subjectId: 2, type: 'happy' },
  { studentId: 1, subjectId: 3, type: 'happy' },
  { studentId: 2, subjectId: 1, type: 'struggling' },
  { studentId: 2, subjectId: 2, type: 'struggling' },
];

function generateSessionsForStudent(studentId: number, subjectId: number, offset: number, hourOffset: number) {
  const sessions = [];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const baseTime = now.getTime() - (offset + i * 7) * 24 * 60 * 60 * 1000;
    sessions.push({
      parent_id: 1,
      student_id: studentId,
      tutor_id: 1,
      subject_id: subjectId,
      scheduled_at: new Date(baseTime + hourOffset * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(baseTime + hourOffset * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    });
  }
  const futureTime = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  sessions.push({
    parent_id: 1,
    student_id: studentId,
    tutor_id: 1,
    subject_id: subjectId,
    scheduled_at: new Date(futureTime + hourOffset * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(futureTime + hourOffset * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'Scheduled',
    slot_units: 2,
  });
  return sessions;
}

async function seedSessions() {
  console.log('🌱 Seeding sessions...');

  const allSessions = [];
  let offset = 180;

  for (let si = 0; si < studentSubjects.length; si++) {
    const ss = studentSubjects[si];
    const sessions = generateSessionsForStudent(ss.studentId, ss.subjectId, offset, si * 3);
    allSessions.push(...sessions);
    offset -= 7;
  }

  const insertedSessions = [];

  for (let i = 0; i < allSessions.length; i++) {
    const session = allSessions[i];
    const { data, error } = await supabase.from('sessions').insert(session).select().single();

    if (error) {
      console.error(`Error inserting session ${i + 1}:`, error);
      continue;
    }

    insertedSessions.push(data);
    const subject = subjects.find(s => s.id === session.subject_id);
    console.log(`✅ Created session ${i + 1}: ${subject?.name} - ${session.status}`);
  }

  return insertedSessions;
}

function getMetricsForStudent(sessionIndex: number, studentType: 'happy' | 'struggling') {
  if (studentType === 'happy') {
    const happyPath = [
      { performance: 1, confidence: 1, completed: false },
      { performance: 2, confidence: 2, completed: true },
      { performance: 3, confidence: 3, completed: true },
      { performance: 4, confidence: 4, completed: true },
      { performance: 5, confidence: 5, completed: true },
    ];
    return happyPath[sessionIndex % happyPath.length];
  } else {
    const struggling = [
      { performance: 1, confidence: 1, completed: false },
      { performance: 1, confidence: 1, completed: false },
      { performance: 2, confidence: 2, completed: true },
      { performance: 2, confidence: 1, completed: false },
      { performance: 3, confidence: 2, completed: true },
    ];
    return struggling[sessionIndex % struggling.length];
  }
}

async function seedSessionMetrics(
  sessions: { id: number; subject_id: number; student_id: number; scheduled_at: string }[]
) {
  console.log('📊 Seeding session metrics...');

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];

    if (session.scheduled_at && new Date(session.scheduled_at) > new Date()) {
      console.log(`⏭️  Skipping future session ${session.id}`);
      continue;
    }

    const studentType: 'happy' | 'struggling' = session.student_id === 1 ? 'happy' : 'struggling';
    const metrics = getMetricsForStudent(i, studentType);
    const subject = subjects.find(s => s.id === session.subject_id);

    const { error } = await supabase.from('session_metrics').insert({
      session_id: session.id,
      student_id: session.student_id,
      session_performance: metrics.performance,
      confidence_score: metrics.confidence,
      homework_completed: metrics.completed,
      tutor_comments:
        studentType === 'happy'
          ? `Excellent progress in ${subject?.name}! Keep up the great work.`
          : `Working on improving in ${subject?.name}. Needs more practice between sessions.`,
      recorded_at: session.scheduled_at,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error inserting metrics for session ${session.id}:`, error);
      continue;
    }

    console.log(
      `✅ Added metrics for session ${session.id}: ${subject?.name} - Perf ${metrics.performance}, Conf ${metrics.confidence}`
    );
  }
}

async function seedSessionProgress(sessions: { id: number; subject_id: number; scheduled_at: string }[]) {
  console.log('📝 Seeding session progress...');

  const topicsBySubject: Record<number, string[]> = {
    1: ['Algebra basics', 'Linear equations', 'Variables', 'Solving equations', 'Graphing', 'Review'],
    2: ['Reading comprehension', 'Vocabulary', 'Phonics', 'Story structure', 'Main idea', 'Literary analysis'],
    3: [
      'Scientific method',
      'Physics basics',
      'Biology intro',
      'Chemistry fundamentals',
      'Earth science',
      'Lab skills',
    ],
  };

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];

    if (session.scheduled_at && new Date(session.scheduled_at) > new Date()) {
      continue;
    }

    const topics = topicsBySubject[session.subject_id] || ['General review'];
    const topic = topics[i % topics.length];
    const subject = subjects.find(s => s.id === session.subject_id);

    const { error } = await supabase.from('session_progress').insert({
      session_id: session.id,
      topics: `${subject?.name}: ${topic}`,
      homework_assigned: `Practice ${topic.toLowerCase()}`,
      public_notes: `Covered ${topic} in ${subject?.name}.`,
      internal_notes: 'Regular session.',
      created_at: session.scheduled_at,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error inserting progress for session ${session.id}:`, error);
      continue;
    }

    console.log(`✅ Added progress for session ${session.id}: ${subject?.name} - ${topic}`);
  }
}

async function main() {
  console.log('🚀 Starting seed script...\n');

  await deleteOldSeedData();

  const sessions = await seedSessions();

  if (sessions.length > 0) {
    await seedSessionMetrics(sessions);
    await seedSessionProgress(sessions);
  }

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Summary:');
  console.log('- Created sessions for 2 students:');
  console.log('  - Luke Skywalker (Student 1): Happy path - consistent improvement 1→5');
  console.log('  - Ben Solo (Student 2): Struggling - inconsistent, off days');
  console.log('- 3 subjects: Math, Reading, Science');
  console.log('- Each student has 5 completed + 1 scheduled per subject');
}

main().catch(console.error);
