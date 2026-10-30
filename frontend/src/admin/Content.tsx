import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Chip } from "@/src/ui";
import { api, Site } from "@/src/api";
import { Card, Field, Toggle, SmallBtn, pickAndUpload } from "@/src/admin/kit";

const LEGAL_KEYS = [{ k: "privacy", l: "Privacy" }, { k: "sms", l: "SMS Terms" }, { k: "terms", l: "Terms of Use" }, { k: "risk", l: "Risk Disclosure" }];

export default function Content({ notify }: { notify: (m: string, e?: boolean) => void }) {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [s, setS] = useState<Site | null>(null);
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState("privacy");
  const [pw, setPw] = useState({ current: "", next: "" });

  useEffect(() => {
    api<Site>("/admin/settings", { auth: true }).then(setS).catch((e) => notify(e.message, true));
  }, [notify]);
  if (!s) return <ActivityIndicator color={colors.brand} />;
  const set = (k: keyof Site, v: any) => setS((x) => (x ? { ...x, [k]: v } : x));

  const save = async () => {
    setBusy(true);
    try {
      const r = await api<Site>("/admin/settings", { method: "PUT", body: s, auth: true });
      setS(r);
      qc.invalidateQueries({ queryKey: ["site"] });
      notify("Website content saved.");
    } catch (e: any) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  };
  const uploadTo = async (k: keyof Site, folder: string, types: ("images" | "videos")[]) => {
    try {
      const m = await pickAndUpload(folder, types);
      if (m) {
        set(k, m.url);
        notify("Uploaded — remember to tap Save.");
      }
    } catch (e: any) {
      notify(e.message, true);
    }
  };
  const changePw = async () => {
    try {
      await api("/auth/password", { method: "POST", auth: true, body: { current_password: pw.current, new_password: pw.next } });
      setPw({ current: "", next: "" });
      notify("Password updated.");
    } catch (e: any) {
      notify(e.message, true);
    }
  };
  const doc = s.legal[legal];
  const mediaRow = (k: keyof Site, label: string, folder: string, types: ("images" | "videos")[]) => (
    <View style={{ gap: 8 }}>
      <Field label={label} value={(s[k] as string) || ""} onChange={(v) => set(k, v)} testID={`content-${k}`} placeholder="Upload or paste a link" />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <SmallBtn label="Upload" testID={`content-upload-${k}`} onPress={() => uploadTo(k, folder, types)} icon={<Feather name="upload" size={14} color={colors.onSurface} />} />
        {s[k] ? <SmallBtn label="Clear" testID={`content-clear-${k}`} onPress={() => set(k, "")} /> : null}
      </View>
    </View>
  );
  const SaveBar = () => <SmallBtn tone="dark" label={busy ? "Saving…" : "Save all changes"} testID="content-save" onPress={save} />;

  return (
    <View style={{ gap: S.lg }} testID="admin-content">
      <SaveBar />
      <Card title="Cohort & enrollment">
        <Field label="Next cohort dates" value={s.cohort_dates} onChange={(v) => set("cohort_dates", v)} testID="content-cohort-dates" placeholder="e.g. Mondays, starting …" />
        <Toggle label="Show cohort dates on the website" value={s.show_cohort_dates} onChange={(v) => set("show_cohort_dates", v)} testID="content-show-cohort" />
        <Field label="Enrollment announcement" value={s.announcement} onChange={(v) => set("announcement", v)} testID="content-announcement" placeholder="e.g. Enrollment for the next cohort is now open." />
        <Toggle label="Show announcement at the top of the homepage" value={s.show_announcement} onChange={(v) => set("show_announcement", v)} testID="content-show-announcement" />
        <Field label="Course price" value={s.price} onChange={(v) => set("price", v)} testID="content-price" />
        <Toggle label="Show price on the website" value={s.show_price} onChange={(v) => set("show_price", v)} testID="content-show-price" />
        <Field label="Price note" value={s.price_note || ""} onChange={(v) => set("price_note", v)} testID="content-price-note" multiline />
        <Field label="Payment plan details (one per line)" value={s.payment_plan || ""} onChange={(v) => set("payment_plan", v)} testID="content-payment-plan" multiline />
        <Toggle label="Show payment plan option" value={!!s.show_payment_plan} onChange={(v) => set("show_payment_plan", v)} testID="content-show-payment-plan" />
      </Card>
      <Card title="Featured testimonial">
        <Field label="Authentic student quote" value={s.featured_quote} onChange={(v) => set("featured_quote", v)} testID="content-featured-quote" multiline />
        <Field label="Student name or initials" value={s.featured_name} onChange={(v) => set("featured_name", v)} testID="content-featured-name" />
        <Toggle label="Publish featured testimonial" value={s.featured_published} onChange={(v) => set("featured_published", v)} testID="content-featured-published" hint="Only publish with the student's permission." />
      </Card>
      <Card title="Photos & video">
        {mediaRow("hero_photo", "Hero photo (optional — logo shows if empty)", "headshots", ["images"])}
        {mediaRow("founder_photo", "Founder portrait (Meet Alysha)", "headshots", ["images"])}
        {mediaRow("lifestyle_photo", "Lifestyle photo (Vision of Freedom)", "lifestyle", ["images"])}
        {mediaRow("story_video", "Story video (Before the freedom…)", "lifestyle", ["videos"])}
        {mediaRow("story_video_poster", "Story video cover image (optional)", "lifestyle", ["images"])}
      </Card>
      <Card title="Contact & social">
        <Field label="Contact email" value={s.contact_email} onChange={(v) => set("contact_email", v)} testID="content-contact-email" keyboardType="email-address" />
        <Field label="Support phone (text)" value={s.support_phone} onChange={(v) => set("support_phone", v)} testID="content-support-phone" />
        <Field label="Business mailing address" value={s.business_address} onChange={(v) => set("business_address", v)} testID="content-address" hint="Used on legal pages. Leave empty until confirmed." />
        <Field label="Gold House Instagram (handle)" value={s.instagram_brand} onChange={(v) => set("instagram_brand", v)} testID="content-ig-brand" />
        <Field label="Gold House TikTok (handle)" value={s.tiktok_brand} onChange={(v) => set("tiktok_brand", v)} testID="content-tt-brand" />
        <Field label="Alysha's Instagram (handle)" value={s.instagram_personal} onChange={(v) => set("instagram_personal", v)} testID="content-ig-personal" />
        <Field label="Alysha's TikTok (handle)" value={s.tiktok_personal} onChange={(v) => set("tiktok_personal", v)} testID="content-tt-personal" />
      </Card>
      <Card title="Curriculum">
        {s.curriculum.map((w, i) => (
          <View key={i} style={{ gap: 8 }}>
            <Field label={`Week ${i + 1} title`} value={w.title} onChange={(v) => set("curriculum", s.curriculum.map((x, j) => (j === i ? { ...x, title: v } : x)))} testID={`content-week-${i}-title`} />
            <Field label="Topics (one per line)" value={w.items.join("\n")} multiline onChange={(v) => set("curriculum", s.curriculum.map((x, j) => (j === i ? { ...x, items: v.split("\n") } : x)))} testID={`content-week-${i}-items`} />
          </View>
        ))}
      </Card>
      <Card title="FAQ">
        {s.faq.map((q, i) => (
          <View key={i} style={{ gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: colors.divider }}>
            <Field label={`Question ${i + 1}`} value={q.q} onChange={(v) => set("faq", s.faq.map((x, j) => (j === i ? { ...x, q: v } : x)))} testID={`content-faq-${i}-q`} />
            <Field label="Answer" value={q.a} multiline onChange={(v) => set("faq", s.faq.map((x, j) => (j === i ? { ...x, a: v } : x)))} testID={`content-faq-${i}-a`} />
            <SmallBtn tone="danger" label="Remove question" testID={`content-faq-${i}-remove`} onPress={() => set("faq", s.faq.filter((_, j) => j !== i))} />
          </View>
        ))}
        <SmallBtn label="Add question" testID="content-faq-add" onPress={() => set("faq", [...s.faq, { q: "", a: "" }])} />
      </Card>
      <Card title="Legal pages">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {LEGAL_KEYS.map((l) => <Chip key={l.k} label={l.l} active={legal === l.k} onPress={() => setLegal(l.k)} testID={`content-legal-${l.k}`} />)}
        </View>
        <Field label="Title" value={doc.title} onChange={(v) => set("legal", { ...s.legal, [legal]: { ...doc, title: v } })} testID="content-legal-title" />
        <Field label="Body" value={doc.body} multiline onChange={(v) => set("legal", { ...s.legal, [legal]: { ...doc, body: v } })} testID="content-legal-body" hint="Start a line with “## ” for a heading. {{contact_email}}, {{support_phone}} and {{business_address}} fill in automatically." />
        <Toggle label="Reviewed by owner / legal counsel" value={doc.reviewed} onChange={(v) => set("legal", { ...s.legal, [legal]: { ...doc, reviewed: v } })} testID="content-legal-reviewed" hint="Removes the “under review” note on the page." />
      </Card>
      <Card title="Integrations">
        <Field label="Lead webhook URL (optional)" value={s.webhook_url || ""} onChange={(v) => set("webhook_url", v)} testID="content-webhook" keyboardType="url"
          hint="Each new or updated waitlist contact (with consent status) is sent here, e.g. to Zapier, your email platform, or your SMS provider. No texts are sent by this website." />
      </Card>
      <SaveBar />
      <Card title="Change password">
        <Field label="Current password" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} testID="password-current" secure />
        <Field label="New password (10+ characters)" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} testID="password-new" secure />
        <SmallBtn label="Update password" testID="password-save" onPress={changePw} />
        <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted }}>Signed in sessions last 12 hours.</Text>
      </Card>
    </View>
  );
}
