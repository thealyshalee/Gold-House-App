import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { F, S, Display, Btn, Body, GoldRule } from "@/src/ui";
import { api, setToken, getToken } from "@/src/api";
import { Field } from "@/src/admin/kit";
import { Brand } from "@/src/home/Nav";

export default function AdminLogin() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!(await getToken())) return;
      try {
        await api("/auth/me", { auth: true });
        router.replace("/admin/dashboard" as any);
      } catch {}
    })();
  }, [router]);

  const login = async () => {
    setErr("");
    if (!email.trim() || !password) return setErr("Please enter your email and password.");
    setBusy(true);
    try {
      const r = await api<{ access_token: string }>("/auth/login", { method: "POST", body: { email: email.trim(), password } });
      await setToken(r.access_token);
      router.replace("/admin/dashboard" as any);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }} testID="admin-login-screen">
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }} bottomOffset={24}>
        <View style={{ width: "100%", maxWidth: 420, alignSelf: "center", backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: 32, gap: S.lg }}>
          <Brand onPress={() => router.replace("/")} />
          <GoldRule />
          <Display size={36}>Owner sign in</Display>
          <Body size={14} color={colors.muted}>Private dashboard for managing the Gold House website.</Body>
          <Field label="Email" value={email} onChange={setEmail} testID="admin-email-input" keyboardType="email-address" />
          <Field label="Password" value={password} onChange={setPassword} testID="admin-password-input" secure />
          {err ? <Text testID="admin-login-error" style={{ fontFamily: F.sans, fontSize: 13, color: colors.error }}>{err}</Text> : null}
          <Btn full label="Sign in" testID="admin-login-button" loading={busy} onPress={login} />
          <Text testID="admin-back-to-site" onPress={() => router.replace("/")} style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted, textAlign: "center", textDecorationLine: "underline" }}>Back to website</Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
