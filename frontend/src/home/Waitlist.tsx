import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@react-native-vector-icons/feather";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, Btn, GoldRule, useLayout } from "@/src/ui";
import { Site, api } from "@/src/api";

const EXPERIENCE = ["Completely new", "I've started learning", "I've traded before", "I'm actively trading"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function phoneOk(p: string) {
  const d = p.replace(/\D/g, "");
  if (!p.trim()) return true;
  if (p.trim().startsWith("+")) return d.length >= 8 && d.length <= 15;
  return d.length === 10 || (d.length === 11 && d.startsWith("1"));
}

export default function Waitlist({ site, onSuccess }: { site?: Site; onSuccess?: () => void }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const router = useRouter();
  const [f, setF] = useState({ first: "", last: "", email: "", phone: "", exp: "", emailOk: false, sms: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expOpen, setExpOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [done, setDone] = useState<null | { sms: boolean }>(null);
  const set = (k: keyof typeof f, v: any) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!f.first.trim()) e.first = "Please enter your first name.";
    if (!EMAIL_RX.test(f.email.trim())) e.email = "Please enter a valid email address.";
    if (!f.phone.trim()) e.phone = "Please enter your mobile number.";
    else if (!phoneOk(f.phone)) e.phone = "Please enter a valid mobile number (10 digits for US).";
    if (!f.exp) e.exp = "Please choose your trading experience.";
    if (!f.emailOk) e.emailOk = "Please agree to the Privacy Policy to join the waitlist.";
    setErrors(e);
    setServerErr("");
    if (Object.keys(e).length || busy) return;
    setBusy(true);
    try {
      await api("/waitlist", {
        method: "POST",
        body: { first_name: f.first.trim(), last_name: f.last.trim(), email: f.email.trim(), phone: f.phone.trim(), experience: f.exp,
          email_consent: f.emailOk, sms_consent: f.sms, source_page: "/#waitlist", website: f.website },
      });
      setDone({ sms: f.sms });
      setTimeout(() => onSuccess?.(), 50);
    } catch (err: any) {
      setServerErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  const input = (k: "first" | "last" | "email" | "phone", label: string, opts: any = {}) => (
    <View style={{ flex: 1, minWidth: wide ? 220 : undefined }}>
      <Text style={styles(colors).label}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: errors[k] ? colors.error : colors.border, height: 52 }}>
        {k === "phone" ? <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: colors.muted, paddingLeft: 14 }}>+1</Text> : null}
        <TextInput
          testID={`waitlist-${k}-input`}
          value={f[k]}
          onChangeText={(v) => set(k, v)}
          placeholderTextColor={colors.muted}
          style={{ flex: 1, height: 50, paddingHorizontal: 14, fontFamily: F.sans, fontSize: 16, color: colors.onSurface }}
          accessibilityLabel={label}
          {...opts}
        />
      </View>
      {errors[k] ? <Text testID={`waitlist-${k}-error`} style={styles(colors).err}>{errors[k]}</Text> : null}
    </View>
  );

  const Check = ({ on, onPress, testID, children }: { on: boolean; onPress: () => void; testID: string; children: React.ReactNode }) => (
    <View style={{ flexDirection: "row", gap: 14 }}>
      <Pressable testID={testID} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} hitSlop={10}
        style={{ width: 24, height: 24, borderWidth: 1, borderColor: on ? colors.brandSecondary : colors.onSurface, backgroundColor: on ? colors.brandSecondary : colors.surfaceTertiary, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        {on ? <Feather name="check" size={15} color={colors.onBrandSecondary} /> : null}
      </Pressable>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
  const Link = ({ to, label }: { to: string; label: string }) => (
    <Text testID={`consent-link-${to}`} onPress={() => router.push(`/legal/${to}` as any)} style={{ color: colors.goldDeep, textDecorationLine: "underline", fontFamily: F.sansMed }} accessibilityRole="link">{label}</Text>
  );

  return (
    <Section bg={colors.surface} testID="waitlist-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 40 }}>
          <View style={{ flex: wide ? 0.8 : undefined }}>
            <Eyebrow>Join the Gold House Waitlist</Eyebrow>
            <Display>YOUR SEAT AT THE TABLE STARTS HERE.</Display>
            <Lede style={{ marginTop: S.lg }}>Be the first to know when the next Gold House Trading Intensive opens.</Lede>
            <GoldRule style={{ marginVertical: S.xl }} />
            <Body color={colors.muted}>Add your name to my waitlist and you&apos;ll be the first to hear about the next cohort — dates, enrollment details, and the occasional Gold House update. Spots are limited because I only take 6–12 hand-picked students each month, so the waitlist always hears first.</Body>
          </View>
          <View style={{ flex: wide ? 1 : undefined, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: wide ? 48 : 24 }}>
            {done ? (
              <Animated.View entering={FadeIn.duration(600)} testID="waitlist-success" style={{ alignItems: "center", paddingVertical: 32 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                  <Feather name="home" size={26} color={colors.brand} />
                </View>
                <Display size={wide ? 44 : 34} center style={{ marginTop: S.xl }}>WELCOME TO THE HOUSE. 🏠💛</Display>
                <GoldRule center style={{ marginVertical: S.xl }} />
                <Body center>You&apos;re officially on the Gold House waitlist! Keep an eye on your inbox for upcoming cohort announcements. If you opted into text updates, you&apos;ll hear from us there too.</Body>
              </Animated.View>
            ) : (
              <View style={{ gap: S.xl }} testID="waitlist-form">
                <View style={{ flexDirection: wide ? "row" : "column", gap: S.xl }}>
                  {input("first", "First name *", { autoComplete: "given-name", textContentType: "givenName" })}
                  {input("last", "Last name", { autoComplete: "family-name", textContentType: "familyName" })}
                </View>
                {input("email", "Email address *", { keyboardType: "email-address", autoCapitalize: "none", autoComplete: "email", textContentType: "emailAddress" })}
                {input("phone", "Mobile phone *", { keyboardType: "phone-pad", autoComplete: "tel", textContentType: "telephoneNumber", placeholder: "(555) 123-4567" })}
                <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted, marginTop: -16 }}>I&apos;ll only text you if you check the text-updates box below.</Text>
                <View>
                  <Text style={styles(colors).label}>Trading experience *</Text>
                  <Pressable testID="waitlist-experience-select" onPress={() => setExpOpen(!expOpen)} accessibilityRole="button"
                    style={{ height: 52, borderWidth: 1, borderColor: errors.exp ? colors.error : colors.border, backgroundColor: colors.surfaceTertiary, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14 }}>
                    <Text style={{ fontFamily: F.sans, fontSize: 16, color: f.exp ? colors.onSurface : colors.muted }}>{f.exp || "Select one"}</Text>
                    <Feather name={expOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.onSurface} />
                  </Pressable>
                  {expOpen ? (
                    <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: colors.border }}>
                      {EXPERIENCE.map((x, i) => (
                        <Pressable key={x} testID={`waitlist-experience-option-${i}`} onPress={() => { set("exp", x); setExpOpen(false); }}
                          style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 14, justifyContent: "center", backgroundColor: pressed || f.exp === x ? colors.surfaceSecondary : colors.surfaceTertiary })}>
                          <Text style={{ fontFamily: F.sans, fontSize: 15, color: colors.onSurface }}>{x}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                  {errors.exp ? <Text testID="waitlist-exp-error" style={styles(colors).err}>{errors.exp}</Text> : null}
                </View>
                {/* honeypot field for bots — hidden from people */}
                <TextInput value={f.website} onChangeText={(v) => set("website", v)} style={{ height: 0, width: 0, opacity: 0, position: "absolute" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" tabIndex={-1 as any} />

                <View style={{ gap: S.lg, paddingTop: S.sm, borderTopWidth: 1, borderColor: colors.divider }}>
                  <View style={{ height: S.sm }} />
                  <Check on={f.emailOk} onPress={() => set("emailOk", !f.emailOk)} testID="waitlist-email-consent-checkbox">
                    <Text style={styles(colors).consent}>
                      I agree to the <Link to="privacy" label="Privacy Policy" /> and understand that Gold House Trading may email me about my waitlist request and upcoming cohort enrollment. <Text style={{ color: colors.goldDeep }}>(Required)</Text>
                    </Text>
                    {errors.emailOk ? <Text testID="waitlist-consent-error" style={styles(colors).err}>{errors.emailOk}</Text> : null}
                  </Check>
                  <Check on={f.sms} onPress={() => set("sms", !f.sms)} testID="waitlist-sms-consent-checkbox">
                    <Text style={styles(colors).consent}>
                      Yes, I&apos;d like to receive recurring automated text messages from Gold House Trading about upcoming cohorts, enrollment, classes, and educational updates at the mobile number provided. Consent is not required to purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for assistance. See our <Link to="sms" label="SMS Terms" /> and <Link to="privacy" label="Privacy Policy" />. <Text style={{ color: colors.muted }}>(Optional)</Text>
                    </Text>
                  </Check>
                </View>
                {serverErr ? (
                  <View testID="waitlist-server-error" style={{ borderLeftWidth: 2, borderColor: colors.error, paddingLeft: 12 }}>
                    <Text style={{ fontFamily: F.sans, fontSize: 14, color: colors.error }}>{serverErr}</Text>
                  </View>
                ) : null}
                <Btn full label="Join the Waitlist" testID="waitlist-submit-button" loading={busy} onPress={submit} />
                <Text style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: "center" }}>
                  Gold House Trading provides education, not investment advice. <Text onPress={() => router.push("/legal/risk" as any)} style={{ textDecorationLine: "underline" }}>Trading Risk Disclosure</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </Container>
    </Section>
  );
}

const styles = (c: any) => ({
  label: { fontFamily: F.sansMed, fontSize: 13, color: c.onSurface, marginBottom: 8 },
  err: { fontFamily: F.sans, fontSize: 13, color: c.error, marginTop: 6 },
  consent: { fontFamily: F.sans, fontSize: 13, lineHeight: 21, color: c.onSurface },
});
