import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

type ExpoExtra = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

/** Resolve URL/key from the JS bundle (EXPO_PUBLIC_*) or app.config extra (EAS / embed). */
export function getSupabaseConfig(): { url?: string; key?: string } {
  const extra = Constants.expoConfig?.extra as ExpoExtra | undefined;
  return {
    url:
      process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
      extra?.supabaseUrl?.trim(),
    key:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      extra?.supabasePublishableKey?.trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. For local APK builds, add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env. For EAS cloud builds, define the same names under Project → Environment variables or eas secret:create.",
    );
  }
  client = createClient(url, key, {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

/** Lazily creates the client so missing env at import time does not crash the native shell. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c as object, prop, receiver);
    if (typeof value === "function") {
      return value.bind(c);
    }
    return value;
  },
});
