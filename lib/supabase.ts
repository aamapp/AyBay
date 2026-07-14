
import { createClient } from '@supabase/supabase-js';

/**
 * সুপাবেজ কানেকশন সেটআপ।
 * ব্যবহারকারীর প্রদানকৃত সুপাবেজ ক্রেডেনশিয়াল ব্যবহার করা হয়েছে।
 */

// Added explicit string type to allow comparison with placeholder literals in isConfigured
const supabaseUrl: string = 'https://qhdilfkpkmbdrijtnaxb.supabase.co'; 
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZGlsZmtwa21iZHJpanRuYXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDYwOTcsImV4cCI6MjA5OTU4MjA5N30.c1NNs5aJDj4w6NVV3eFwzlwd_rcDkZcJ4-I_c4PINLU';

// চেক করা হচ্ছে কনফিগারেশন কি প্লেসহোল্ডার নাকি আসল
export const isConfigured = 
  supabaseUrl !== '' && 
  supabaseUrl !== 'https://your-project-url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

// সুপাবেজ ক্লায়েন্ট তৈরি
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
