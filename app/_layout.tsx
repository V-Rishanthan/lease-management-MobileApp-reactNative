import { supabase } from "@/lib/supabase";
import { store } from "@/store";
import { setSession } from "@/store/authSlice";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";

function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      dispatch(setSession(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch(setSession(session));
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [dispatch]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthBootstrap />
    </Provider>
  );
}
