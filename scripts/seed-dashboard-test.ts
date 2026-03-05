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
  { studentId: 1, subjectId: 1 },
  { studentId: 1, subjectId: 2 },
  { studentId: 1, subjectId: 3 },
  { studentId: 2, subjectId: 1 },
  { studentId: 2, subjectId: 2 },
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

async function seedSessionMetrics(
  sessions: { id: number; subject_id: number; student_id: number; scheduled_at: string }[]
) {
  console.log('📊 Seeding session metrics...');

  const metricsTemplates = [
    { performance: 2, confidence: 2, completed: false },
    { performance: 2, confidence: 2, completed: true },
    { performance: 3, confidence: 3, completed: true },
    { performance: 3, confidence: 3, completed: false },
    { performance: 3, confidence: 3, completed: true },
    { performance: 4, confidence: 4, completed: true },
  ];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];

    if (session.scheduled_at && new Date(session.scheduled_at) > new Date()) {
      console.log(`⏭️  Skipping future session ${session.id}`);
      continue;
    }

    const metrics = metricsTemplates[i % metricsTemplates.length];
    const subject = subjects.find(s => s.id === session.subject_id);

    const { error } = await supabase.from('session_metrics').insert({
      session_id: session.id,
      student_id: session.student_id,
      session_performance: metrics.performance,
      confidence_score: metrics.confidence,
      homework_completed: metrics.completed,
      tutor_comments: `Great progress in ${subject?.name}!`,
      recorded_at: session.scheduled_at,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error inserting metrics for session ${session.id}:`, error);
      continue;
    }

    console.log(`✅ Added metrics for session ${session.id}: ${subject?.name} - Perf ${metrics.performance}`);
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
      public_notes: `Covered ${topic} in ${subject?.name}. Student showed good understanding.`,
      internal_notes: 'Student is making progress. Continue with current curriculum.',
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
  console.log(`- Created ${sessions.length} sessions`);
  console.log(`- For 2 students (Luke Skywalker, Ben Solo)`);
  console.log(`- 3 subjects: Math, Reading, Science`);
  console.log(`- 5 completed + 1 scheduled per subject per student = 30 sessions total`);
}

main().catch(console.error);
