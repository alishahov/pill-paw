// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oapzrcxnhvhecaysgtcv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcHpyY3huaHZoZWNheXNndGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDU4MzUsImV4cCI6MjA2NjU4MTgzNX0.NkuY8lhqbLEJbxeFPXCUyM9IgFEBmaSoGwj8WACFftg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);