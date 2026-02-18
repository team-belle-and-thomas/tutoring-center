import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
console.log('Supabase client created successfully');

export default client;