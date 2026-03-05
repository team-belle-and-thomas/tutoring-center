import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxxxx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function seedSessions() {
  console.log('🌱 Seeding sessions...');

  const now = new Date();

  const sessions = [
    {
      scheduled_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 165 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 165 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 105 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 105 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      slot_units: 2,
    },
    {
      scheduled_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: 'Scheduled',
      slot_units: 2,
    },
  ];

  const insertedSessions = [];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        parent_id: 1,
        student_id: 1,
        tutor_id: 1,
        subject_id: 1,
        scheduled_at: session.scheduled_at,
        ends_at: session.ends_at,
        status: session.status,
        slot_units: session.slot_units,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error inserting session ${i + 1}:`, error);
      continue;
    }

    insertedSessions.push(data);
    console.log(`✅ Created session ${i + 1}: ${session.scheduled_at} (${session.status})`);
  }

  return insertedSessions;
}

async function seedSessionMetrics(sessions: { id: number; scheduled_at: string }[]) {
  console.log('📊 Seeding session metrics...');

  const metricsData = [
    {
      session_performance: 2.5,
      confidence_score: 2,
      homework_completed: false,
      topics: 'Introduction to algebra basics',
    },
    { session_performance: 2.5, confidence_score: 2.5, homework_completed: true, topics: 'Linear equations practice' },
    { session_performance: 3, confidence_score: 3, homework_completed: true, topics: 'Introduction to variables' },
    { session_performance: 3, confidence_score: 3.5, homework_completed: false, topics: 'Solving simple equations' },
    { session_performance: 3.5, confidence_score: 3.5, homework_completed: true, topics: 'Algebraic expressions' },
    { session_performance: 3.5, confidence_score: 4, homework_completed: true, topics: 'Multi-step equations' },
    { session_performance: 4, confidence_score: 4, homework_completed: true, topics: 'Graphing linear equations' },
    { session_performance: 4, confidence_score: 4.5, homework_completed: true, topics: 'Slope and intercept practice' },
    {
      session_performance: 4.5,
      confidence_score: 4.5,
      homework_completed: true,
      topics: 'Systems of equations introduction',
    },
    { session_performance: 4.5, confidence_score: 4.5, homework_completed: false, topics: 'Word problems practice' },
    { session_performance: 4.5, confidence_score: 4, homework_completed: true, topics: 'Quadratic equations basics' },
    { session_performance: 4.5, confidence_score: 4.5, homework_completed: true, topics: 'Factoring polynomials' },
    { session_performance: 5, confidence_score: 5, homework_completed: true, topics: 'Review and practice test' },
    { session_performance: 5, confidence_score: 5, homework_completed: true, topics: 'Advanced word problems' },
  ];

  for (let i = 0; i < sessions.length - 1; i++) {
    const session = sessions[i];

    if (session.scheduled_at && new Date(session.scheduled_at) > new Date()) {
      console.log(`⏭️  Skipping future session ${session.id}`);
      continue;
    }

    const metrics = metricsData[i];

    const { error } = await supabase.from('session_metrics').insert({
      session_id: session.id,
      student_id: 1,
      session_performance: metrics.session_performance,
      confidence_score: metrics.confidence_score,
      homework_completed: metrics.homework_completed,
      tutor_comments: `Great progress on ${metrics.topics.toLowerCase()}. Keep up the good work!`,
      recorded_at: new Date(session.scheduled_at).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error inserting metrics for session ${session.id}:`, error);
      continue;
    }

    console.log(
      `✅ Added metrics for session ${session.id}: Performance ${metrics.session_performance}, Confidence ${metrics.confidence_score}`
    );
  }

  console.log('⏭️  Last session (scheduled) has no metrics - ready for E2E testing');
}

async function seedSessionProgress(sessions: { id: number; scheduled_at: string }[]) {
  console.log('📝 Seeding session progress...');

  const progressData = [
    {
      topics: 'Introduction to algebra basics, understanding variables and constants',
      homework_assigned: 'Complete practice problems 1-10 from textbook',
    },
    { topics: 'Linear equations practice, solving for x', homework_assigned: 'Worksheet on linear equations' },
    { topics: 'Introduction to variables and coefficients', homework_assigned: 'Practice problems 11-20' },
    { topics: 'Solving simple one-step equations', homework_assigned: 'None - spring break' },
    { topics: 'Algebraic expressions and evaluating', homework_assigned: 'Expression practice sheet' },
    {
      topics: 'Multi-step equations and the distributive property',
      homework_assigned: 'Multi-step problems worksheet',
    },
    { topics: 'Introduction to graphing, plotting points', homework_assigned: 'Graph practice problems' },
    { topics: 'Slope and y-intercept, equation of a line', homework_assigned: 'Line graphing assignment' },
    { topics: 'Systems of equations - substitution method', homework_assigned: 'Systems practice problems' },
    { topics: 'Word problems - translating to equations', homework_assigned: 'None - parent conference week' },
    { topics: 'Introduction to quadratic equations', homework_assigned: 'Quadratic basics worksheet' },
    { topics: 'Factoring polynomials - greatest common factor', homework_assigned: 'Factoring practice' },
    { topics: 'Comprehensive review, practice test', homework_assigned: 'Practice test (no homework)' },
    { topics: 'Advanced multi-step word problems', homework_assigned: 'Challenge problems' },
  ];

  for (let i = 0; i < sessions.length - 1; i++) {
    const session = sessions[i];

    if (session.scheduled_at && new Date(session.scheduled_at) > new Date()) {
      continue;
    }

    const progress = progressData[i];

    const { error } = await supabase.from('session_progress').insert({
      session_id: session.id,
      topics: progress.topics,
      homework_assigned: progress.homework_assigned,
      public_notes: `Covered ${progress.topics.toLowerCase()}. Student showed good understanding of key concepts.`,
      internal_notes: `Parent should review homework to support learning.`,
      created_at: new Date(session.scheduled_at).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error inserting progress for session ${session.id}:`, error);
      continue;
    }

    console.log(`✅ Added progress for session ${session.id}: ${progress.topics.substring(0, 40)}...`);
  }

  console.log('⏭️  Last session (scheduled) has no progress - ready for E2E testing');
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
  console.log(`- ${sessions.length - 1} sessions have progress reports and metrics (historical)`);
  console.log(`- 1 session is scheduled for future (no metrics yet) - for E2E testing`);
  console.log('\n💡 To test the dashboard:');
  console.log('1. Log in as the first user (parent)');
  console.log('2. Navigate to the dashboard');
  console.log('3. You should see charts with progress data from the completed sessions');
  console.log('4. The scheduled session will appear once filled out by a tutor');
}

main().catch(console.error);
