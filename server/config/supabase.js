import { createClient } from '@supabase/supabase-js';
// require('dotenv').config();
// import 'react-native-url-polyfill/auto';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ucgzqcgbsindbgocpsge.supabase.co';
const supabaseAnonKey = 'sb_publishable_Fq3GA_iAgULHsUypURWnXg_BPyM2mVa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// module.exports = supabase;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
//});