import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function checkSubjects() {
  console.log('=== Subjects ===');
  const { data: subjects } = await supabase.from('subjects').select('*');
  console.log(subjects);
}

checkSubjects();
