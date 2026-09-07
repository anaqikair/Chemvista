import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://llmeendmbxgqfebyobcd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbWVlbmRtYnhncWZlYnlvYmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzEwNTAsImV4cCI6MjEwNDM0NzA1MH0.LGC-G1v-QhUph_kwJGUCp3wtcFDG3Q2mkDNzEEgSHKY';

// Clean URL: remove trailing '/rest/v1' or trailing slashes if present
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
