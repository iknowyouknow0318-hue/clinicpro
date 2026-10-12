import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzjfiqvlhghlogufbohz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Tsq66pQoUNHLgoMcJZdXRA_xkb4btlI';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Helper to subscribe to live queue changes via Supabase Realtime WebSocket channel.
 */
export function subscribeToQueueUpdates(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel('public:queue_tokens')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'queue_tokens' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
