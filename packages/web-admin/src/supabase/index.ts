import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";

// Temporarily disabled for Tailwind testing
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = {} as any; // Mock client

export default supabase;
