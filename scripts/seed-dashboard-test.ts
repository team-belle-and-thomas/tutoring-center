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

function generateSessionsForStudent(studentId: number, subjectId: number, startWeek: number, hourOffset: number) {
  const sessions = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const daysAgo = startWeek * 7 + i * 14;
    const baseTime = now.getTime() - daysAgo * 24 * 60 * 60 * 1000;
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
  let startWeek = 26;

  for (let si = 0; si < studentSubjects.length; si++) {
    const ss = studentSubjects[si];
    const sessions = generateSessionsForStudent(ss.studentId, ss.subjectId, startWeek, si * 3);
    allSessions.push(...sessions);
    startWeek -= 2;
  }

  const recentSessions = [];
  for (let si = 0; si < studentSubjects.length; si++) {
    const ss = studentSubjects[si];
    for (let i = 0; i < 3; i++) {
      const daysAgo = i * 10;
      const baseTime = new Date().getTime() - daysAgo * 24 * 60 * 60 * 1000;
      recentSessions.push({
        parent_id: 1,
        student_id: ss.studentId,
        tutor_id: 1,
        subject_id: ss.subjectId,
        scheduled_at: new Date(baseTime + si * 3 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(baseTime + si * 3 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        status: 'Completed',
        slot_units: 2,
      });
    }
  }

  const allCombined = [...recentSessions, ...allSessions];

  const insertedSessions = [];

  for (let i = 0; i < allCombined.length; i++) {
    const session = allCombined[i];
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
      { performance: 2, confidence: 3, completed: true },
      { performance: 3, confidence: 3, completed: true },
      { performance: 4, confidence: 4, completed: true },
      { performance: 4, confidence: 4, completed: false },
      { performance: 5, confidence: 5, completed: true },
    ];
    return happyPath[sessionIndex % happyPath.length];
  } else {
    const struggling = [
      { performance: 1, confidence: 1, completed: false },
      { performance: 1, confidence: 1, completed: false },
      { performance: 2, confidence: 2, completed: true },
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

  const sessionsByStudent = new Map<number, typeof sessions>();
  for (const session of sessions) {
    if (!sessionsByStudent.has(session.student_id)) {
      sessionsByStudent.set(session.student_id, []);
    }
    sessionsByStudent.get(session.student_id)!.push(session);
  }

  for (const [studentId, studentSessions] of sessionsByStudent) {
    const completedSessions = studentSessions
      .filter(s => s.scheduled_at && new Date(s.scheduled_at) < new Date())
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const sessionsToFill = completedSessions.slice(0, -2);
    const sessionsToSkip = completedSessions.slice(-2);

    console.log(
      `  Student ${studentId}: filling ${sessionsToFill.length}, skipping ${sessionsToSkip.length} (no data yet)`
    );

    for (let i = 0; i < sessionsToFill.length; i++) {
      const session = sessionsToFill[i];
      const studentType: 'happy' | 'struggling' = studentId === 1 ? 'happy' : 'struggling';
      const metrics = getMetricsForStudent(i, studentType);
      const subject = subjects.find(s => s.id === session.subject_id);

      const { error } = await supabase.from('session_metrics').insert({
        session_id: session.id,
        student_id: session.student_id,
        session_performance: metrics.performance,
        confidence_score: metrics.confidence,
        homework_completed: metrics.completed,
        tutor_comments:
          studentType === 'happy' ? `Great progress in ${subject?.name}!` : `Working on improving in ${subject?.name}.`,
        recorded_at: session.scheduled_at,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`Error inserting metrics for session ${session.id}:`, error);
        continue;
      }

      console.log(`  ✅ Session ${session.id} (${subject?.name}): Perf ${metrics.performance}`);
    }

    for (const session of sessionsToSkip) {
      const subject = subjects.find(s => s.id === session.subject_id);
      console.log(`  ⏭️  Session ${session.id} (${subject?.name}): NO METRICS YET`);
    }
  }
}

async function seedSessionProgress(sessions: { id: number; subject_id: number; scheduled_at: string }[]) {
  console.log('📝 Seeding session progress...');

  const topicsBySubject: Record<number, string[]> = {
    1: ['Algebra basics', 'Linear equations', 'Variables', 'Solving equations', 'Graphing', 'Quadratics', 'Review'],
    2: [
      'Reading comprehension',
      'Vocabulary',
      'Phonics',
      'Story structure',
      'Main idea',
      'Literary analysis',
      'Analysis',
    ],
    3: [
      'Scientific method',
      'Physics basics',
      'Biology intro',
      'Chemistry fundamentals',
      'Earth science',
      'Lab skills',
      'Review',
    ],
  };

  const sessionsWithMetrics = sessions.slice(0, -10);

  for (let i = 0; i < sessionsWithMetrics.length; i++) {
    const session = sessionsWithMetrics[i];

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

    console.log(`✅ Progress: Session ${session.id} - ${subject?.name}`);
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
  console.log('- 2 students spread over 6 months:');
  console.log('  - Luke Skywalker: Happy path - improvement 1→5 over time');
  console.log('  - Ben Solo: Struggling - inconsistent');
  console.log('- 3 subjects each: Math, Reading, Science');
  console.log('- 7 completed + 1 scheduled per subject');
  console.log('- Last 2 sessions per student have NO metrics (for E2E testing)');
}

main().catch(console.error);
