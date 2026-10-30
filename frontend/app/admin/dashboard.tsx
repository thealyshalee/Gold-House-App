import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useQuery } from "@tanstack/react-query";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Chip, Display } from "@/src/ui";
import { api, clearToken } from "@/src/api";
import { Brand } from "@/src/home/Nav";
import { Card } from "@/src/admin/kit";
import Leads from "@/src/admin/Leads";
import Gallery from "@/src/admin/Gallery";
import Content from "@/src/admin/Content";
import MediaLib from "@/src/admin/MediaLib";

const TABS = ["Overview", "Leads", "Gallery", "Content", "Media"] as const;
type Tab = (typeof TABS)[number];

export default function Dashboard() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);

  useEffect(() => {
    api("/auth/me", { auth: true }).then(() => setOk(true)).catch(async () => {
      await clearToken();
      router.replace("/admin" as any);
    });
  }, [router]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (msg: string, err?: boolean) => setToast({ msg, err });
  const signOut = async () => {
    await clearToken();
    router.replace("/admin" as any);
  };

  if (!ok) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSecondary }}><ActivityIndicator color={colors.brand} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }} testID="admin-dashboard">
      <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border }}>
        <View style={{ height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, maxWidth: 1200, width: "100%", alignSelf: "center" }}>
          <Brand onPress={() => router.push("/")} />
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Pressable testID="admin-view-site" onPress={() => router.push("/")} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityLabel="View website">
              <Feather name="external-link" size={18} color={colors.onSurface} />
            </Pressable>
            <Pressable testID="admin-sign-out" onPress={signOut} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Sign out">
              <Feather name="log-out" size={18} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>
        <View style={{ height: 56 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, alignItems: "center" }}>
            {TABS.map((t) => <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} testID={`admin-tab-${t.toLowerCase()}`} />)}
          </ScrollView>
        </View>
      </View>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, maxWidth: 1200, width: "100%", alignSelf: "center" }} bottomOffset={24}>
        {tab === "Overview" ? <Overview go={setTab} /> : tab === "Leads" ? <Leads notify={notify} /> : tab === "Gallery" ? <Gallery notify={notify} /> : tab === "Content" ? <Content notify={notify} /> : <MediaLib notify={notify} />}
      </KeyboardAwareScrollView>
      {toast ? (
        <View testID="admin-toast" style={{ position: "absolute", left: 20, right: 20, bottom: insets.bottom + 16, backgroundColor: toast.err ? colors.error : colors.surfaceInverse, padding: 16, maxWidth: 520, alignSelf: "center" }}>
          <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: colors.onSurfaceInverse }}>{toast.msg}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Overview({ go }: { go: (t: Tab) => void }) {
  const { colors } = useTheme();
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => api("/admin/stats", { auth: true }) });
  const stats = [
    { k: "total", l: "Waitlist contacts", t: "Leads" },
    { k: "last_7_days", l: "New this week", t: "Leads" },
    { k: "email_subscribed", l: "Email subscribed", t: "Leads" },
    { k: "sms_opted_in", l: "SMS opted in", t: "Leads" },
    { k: "testimonials_published", l: "Published results", t: "Gallery" },
    { k: "testimonials_draft", l: "Drafts to review", t: "Gallery" },
  ] as const;
  return (
    <View style={{ gap: S.xl }}>
      <Display size={40}>Welcome home, Alysha.</Display>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {stats.map((s) => (
          <Pressable key={s.k} testID={`stat-${s.k}`} onPress={() => go(s.t)} style={{ flexGrow: 1, flexBasis: 160, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
            <Text style={{ fontFamily: F.serif, fontSize: 40, color: colors.onSurface }}>{data ? (data as any)[s.k] : "–"}</Text>
            <Text style={{ fontFamily: F.sansMed, fontSize: 12, letterSpacing: 1, color: colors.muted }}>{s.l}</Text>
          </Pressable>
        ))}
      </View>
      <Card title="Setup checklist">
        {[
          "Text messaging: no texts are sent from this site. Export SMS opted-in contacts, or add your provider's webhook URL in Content → Integrations once your number and registration are approved.",
          "Email: contacts are saved and exportable. Connect your email marketing tool via the same webhook or CSV import.",
          "Legal pages are drafts — review them (Content → Legal pages) and mark each as reviewed.",
          "Upload your story video in Content → Photos & video to show it in the “Before the freedom” section.",
          "Two student screenshots are saved as drafts because their caption text predicts future results — review them in Gallery.",
        ].map((t) => (
          <View key={t} style={{ flexDirection: "row", gap: 10 }}>
            <Feather name="circle" size={10} color={colors.brand} style={{ marginTop: 6 }} />
            <Text style={{ flex: 1, fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: colors.onSurface }}>{t}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}
