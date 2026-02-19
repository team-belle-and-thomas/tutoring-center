import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../types/supabase';

dotenv.config();

const client = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
console.log('Supabase client created successfully');

export default client;
