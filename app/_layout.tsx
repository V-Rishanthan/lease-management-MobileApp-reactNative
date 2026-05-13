import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { store } from "@/store";
import { setSession } from "@/store/authSlice";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Provider, useDispatch } from "react-redux";

function MissingSupabaseConfig() {
  return (
    <View style={styles.missing}>
      <Text style={styles.missingTitle}>Configuration required</Text>
      <Text style={styles.missingBody}>
        Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to
        your .env file for local builds, or set them as EAS environment
        variables for cloud builds, then rebuild the app.
      </Text>
    </View>
  );
}

function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Failed to restore Supabase session:", error.message);
        }
        if (isMounted) {
          dispatch(setSession(data.session ?? null));
        }
      } catch (error) {
        // Avoid unhandled startup crash when fetch/network layer throws.
        console.warn("Session bootstrap failed:", error);
        if (isMounted) {
          dispatch(setSession(null));
        }
      }
    };
    bootstrapSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        try {
          dispatch(setSession(session));
        } catch (error) {
          console.warn("Auth state dispatch failed:", error);
        }
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  if (!isSupabaseConfigured()) {
    return <MissingSupabaseConfig />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  missingBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
});

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthBootstrap />
    </Provider>
  );
}
