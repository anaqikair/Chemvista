import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbbcadlyomwxfxzccnvr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmNhZGx5b213eGZ4emNjbnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTMzOTUsImV4cCI6MjEwMDM4OTM5NX0.NGoi5eILD0U4hQefnBQj4Jzfp03ooBk0mnACAN_dPeI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
