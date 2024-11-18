// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wekxcgoqkxqisrdmgvkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indla3hjZ29xa3hxaXNyZG1ndmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4Nzk3NDMsImV4cCI6MjA0NzQ1NTc0M30.Ue7TmjUIgk1N1UB--Ouk_Cj_2REDaGaPXtmcni_QW5s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
