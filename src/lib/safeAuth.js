// Supabase Configuration - Handle race conditions
import { supabase } from './supabase';

let sessionCheckInProgress = false;

/**
 * Safe session check that prevents race conditions
 */
export async function getSafeSession() {
  // Prevent concurrent session checks
  while (sessionCheckInProgress) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  sessionCheckInProgress = true;

  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } finally {
    sessionCheckInProgress = false;
  }
}

/**
 * Debounced profile fetch to prevent concurrent requests
 */
let profileFetchInProgress = null;

export async function getSafeProfile(userId) {
  if (profileFetchInProgress) {
    return profileFetchInProgress;
  }

  profileFetchInProgress = (async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } finally {
      profileFetchInProgress = null;
    }
  })();

  return profileFetchInProgress;
}
