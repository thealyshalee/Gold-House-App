import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Linking, Platform } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Chip } from "@/src/ui";
import { api, BASE, getToken } from "@/src/api";
import { SmallBtn } from "@/src/admin/kit";

const EXP = ["Completely new", "I've started learning", "I've traded before", "I'm actively trading"];

export default function Leads({ notify }: { notify: (m: string, e?: boolean) => void }) {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [exp, setExp] = useState("");
  const [consent, setConsent] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const params = new URLSearchParams({ q, experience: exp, ...(consent === "email" ? { email_status: "subscribed" } : {}), ...(consent === "sms" ? { sms_status: "opted_in" } : {}), ...(consent === "unsub" ? { email_status: "unsubscribed" } : {}) });
  const { data, isLoading, refetch } = useQuery({ queryKey: ["leads", params.toString()], queryFn: () => api<any[]>(`/admin/leads?${params}`, { auth: true }) });

  const exportCsv = async (type: "all" | "sms") => {
    const token = await getToken();
    const url = `${BASE}/api/admin/leads/export?type=${type}&token=${encodeURIComponent(token || "")}`;
    if (Platform.OS === "web") (window as any).open(url, "_blank");
    else Linking.openURL(url);
  };
  const patch = async (id: string, body: any, msg: string) => {
    try {
      await api(`/admin/leads/${id}`, { method: "PATCH", body, auth: true });
      notify(msg);
      refetch();
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e: any) {
      notify(e.message, true);
    }
  };
  const remove = async (id: string) => {
    if (confirm !== id) return setConfirm(id);
    await api(`/admin/leads/${id}`, { method: "DELETE", auth: true });
    setConfirm(null);
    notify("Contact removed and unsubscribed.");
    refetch();
  };

  const filters = [
    { k: "", l: "All consents" }, { k: "email", l: "Email subscribed" }, { k: "sms", l: "SMS opted in" }, { k: "unsub", l: "Unsubscribed" },
  ];

  return (
    <View style={{ gap: S.lg }} testID="admin-leads">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <SmallBtn label="Export all (CSV)" testID="leads-export-all" onPress={() => exportCsv("all")} tone="dark" icon={<Feather name="download" size={14} color={colors.onBrandSecondary} />} />
        <SmallBtn label="Export SMS opted-in" testID="leads-export-sms" onPress={() => exportCsv("sms")} icon={<Feather name="message-square" size={14} color={colors.onSurface} />} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceTertiary, height: 48, paddingHorizontal: 12, gap: 8 }}>
        <Feather name="search" size={16} color={colors.muted} />
        <TextInput testID="leads-search-input" value={q} onChangeText={setQ} placeholder="Search name, email, phone or referrer" placeholderTextColor={colors.muted} autoCapitalize="none" style={{ flex: 1, fontFamily: F.sans, fontSize: 15, color: colors.onSurface, height: 46 }} />
      </View>
      <View style={{ height: 56 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: "center" }}>
          {filters.map((f) => <Chip key={f.k} label={f.l} active={consent === f.k} onPress={() => setConsent(f.k)} testID={`leads-filter-consent-${f.k || "all"}`} />)}
        </ScrollView>
      </View>
      <View style={{ height: 56, marginTop: -16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: "center" }}>
          {["", ...EXP].map((e, i) => <Chip key={e || "all"} label={e || "All experience"} active={exp === e} onPress={() => setExp(e)} testID={`leads-filter-exp-${i}`} />)}
        </ScrollView>
      </View>
      {isLoading ? <ActivityIndicator color={colors.brand} /> : !data?.length ? (
        <View testID="leads-empty" style={{ padding: 40, alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceTertiary }}>
          <Feather name="inbox" size={28} color={colors.brand} />
          <Text style={{ fontFamily: F.serif, fontSize: 24, color: colors.onSurface, marginTop: 12 }}>No contacts yet</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted, marginTop: 4 }}>New waitlist sign-ups will appear here.</Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted }}>{data.length} contact{data.length === 1 ? "" : "s"}</Text>
          {data.map((l) => (
            <View key={l.id} testID={`lead-row-${l.id}`} style={{ backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border }}>
              <Pressable onPress={() => setOpen(open === l.id ? null : l.id)} style={{ padding: 16, flexDirection: "row", gap: 12, alignItems: "center" }} testID={`lead-toggle-${l.id}`}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: F.sansSemi, fontSize: 15, color: colors.onSurface }}>{l.first_name} {l.last_name}</Text>
                  <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted }}>{l.email}{l.phone ? ` · ${l.phone}` : ""}</Text>
                  {l.referred_by ? <Text testID={`lead-referred-${l.id}`} style={{ fontFamily: F.sansMed, fontSize: 12, color: colors.goldDeep }}>Referred by {l.referred_by}</Text> : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    <Badge label={l.experience} />
                    <Badge label={`Email: ${l.email_status}`} tone={l.email_status === "subscribed" ? "ok" : "off"} />
                    <Badge label={`SMS: ${l.sms_status === "opted_in" ? "opted in" : l.sms_status === "opted_out" ? "opted out" : "no consent"}`} tone={l.sms_status === "opted_in" ? "ok" : "off"} />
                  </View>
                </View>
                <Feather name={open === l.id ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
              </Pressable>
              {open === l.id ? (
                <View style={{ padding: 16, paddingTop: 0, gap: 12 }}>
                  <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted }}>Joined {new Date(l.created_at).toLocaleString()} · Updated {new Date(l.updated_at).toLocaleString()} · Submissions: {l.submissions}</Text>
                  <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 2, color: colors.goldDeep }}>CONSENT RECORD</Text>
                  {(l.consent_log || []).map((c: any, i: number) => (
                    <View key={i} style={{ borderLeftWidth: 1, borderColor: colors.brand, paddingLeft: 10 }}>
                      <Text style={{ fontFamily: F.sansMed, fontSize: 12, color: colors.onSurface }}>{c.channel.toUpperCase()} · {c.action.replace(/_/g, " ")} · {new Date(c.timestamp).toLocaleString()}{c.version ? ` · ${c.version}` : ""}{c.source_page ? ` · ${c.source_page}` : ""}</Text>
                      {c.text ? <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: colors.muted }}>&ldquo;{c.text}&rdquo;</Text> : null}
                    </View>
                  ))}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {l.email_status === "subscribed" ? <SmallBtn label="Mark email unsubscribed" testID={`lead-unsub-email-${l.id}`} onPress={() => patch(l.id, { email_status: "unsubscribed" }, "Email marked unsubscribed.")} /> : null}
                    {l.sms_status === "opted_in" ? <SmallBtn label="Opt out of SMS" testID={`lead-optout-sms-${l.id}`} onPress={() => patch(l.id, { sms_status: "opted_out" }, "SMS opt-out recorded.")} /> : null}
                    <SmallBtn tone="danger" label={confirm === l.id ? "Tap again to remove" : "Remove contact"} testID={`lead-remove-${l.id}`} onPress={() => remove(l.id)} />
                  </View>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone?: "ok" | "off" }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: tone === "ok" ? colors.success : colors.border }}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 11, color: tone === "ok" ? colors.success : colors.muted }}>{label}</Text>
    </View>
  );
}
