import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flxsreyuvdtcifiknpkn.supabase.co'; // Derived from postgresql url
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseHNyZXl1dmR0Y2lmaWtucGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzY4MjIsImV4cCI6MjA4NzM1MjgyMn0.CG_WVMls2E4Cn0ce7NOhiRyzF2VOLbsmizxh8l07DAk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
