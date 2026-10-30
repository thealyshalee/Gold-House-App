import React, { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, Btn, GoldRule, Accordion, useLayout } from "@/src/ui";
import { Site } from "@/src/api";
import type { Anchor } from "@/app/index";

export function FaqSection({ site }: { site?: Site }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section bg={colors.surfaceSecondary} testID="faq-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 32 }}>
          <View style={{ flex: wide ? 0.6 : undefined }}>
            <Eyebrow>Your questions</Eyebrow>
            <Display>FREQUENTLY ASKED.</Display>
            <Body color={colors.muted} style={{ marginTop: S.lg }}>Don&apos;t see your question here? Email me at {site?.contact_email || "my inbox"}{site?.support_phone ? ` or text ${site.support_phone}` : ""} — I&apos;m happy to help.</Body>
          </View>
          <View style={{ flex: wide ? 1 : undefined, borderTopWidth: 1, borderColor: colors.border }}>
            {(site?.faq ?? []).map((q, i) => (
              <Accordion key={i} title={q.q} open={open === i} onToggle={() => setOpen(open === i ? null : i)} testID={`faq-item-${i}`}>
                <Body color={colors.muted}>{q.a}</Body>
              </Accordion>
            ))}
          </View>
        </View>
      </Container>
    </Section>
  );
}

export function FinalCta({ onNav }: { onNav: (k: Anchor) => void }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.brandSecondary} testID="final-cta-section">
      <Container max={900} style={{ alignItems: "center" }}>
        <GoldRule center width={40} />
        <Display center color={colors.onBrandSecondary} size={wide ? 68 : 42} style={{ marginTop: S.xxl }}>EVERY EXPERT WAS ONCE A BEGINNER.</Display>
        <Lede center color={colors.mutedInverse} style={{ marginTop: S.xl }}>Your next chapter starts with learning a skill. I&apos;d love to help you start yours.</Lede>
        <View style={{ marginTop: S.xxxl, alignSelf: wide ? "center" : "stretch" }}>
          <Btn variant="gold" full={!wide} label="Join the Gold House Waitlist" testID="final-cta-waitlist-button" onPress={() => onNav("waitlist")} />
        </View>
        <Text style={{ fontFamily: F.serif, fontSize: 18, letterSpacing: 6, color: colors.brand, marginTop: S.xxxl }}>WELCOME HOME.</Text>
      </Container>
    </Section>
  );
}

const LEGAL = [
  { k: "privacy", l: "Privacy Policy" },
  { k: "sms", l: "SMS Terms & Conditions" },
  { k: "terms", l: "Terms of Use" },
  { k: "risk", l: "Trading Risk Disclosure" },
];

export function Footer({ site, onNav, bottomInset }: { site?: Site; onNav?: (k: Anchor) => void; bottomInset: number }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const router = useRouter();
  const year = new Date().getFullYear();
  const socials = [
    site?.instagram_brand && { k: "ig-brand", l: `Instagram @${site.instagram_brand}`, u: `https://instagram.com/${site.instagram_brand}` },
    site?.tiktok_brand && { k: "tt-brand", l: `TikTok @${site.tiktok_brand}`, u: `https://tiktok.com/@${site.tiktok_brand}` },
    site?.instagram_personal && { k: "ig-alysha", l: `Alysha on Instagram @${site.instagram_personal}`, u: `https://instagram.com/${site.instagram_personal}` },
    site?.tiktok_personal && { k: "tt-alysha", l: `Alysha on TikTok @${site.tiktok_personal}`, u: `https://tiktok.com/@${site.tiktok_personal}` },
  ].filter(Boolean) as { k: string; l: string; u: string }[];
  const link = (label: string, onPress: () => void, testID: string) => (
    <Pressable key={testID} testID={testID} onPress={onPress} accessibilityRole="link" style={{ paddingVertical: 4 }}>
      {({ hovered }: any) => <Text style={{ fontFamily: F.sans, fontSize: 14, color: hovered ? colors.goldDeep : colors.onSurface }}>{label}</Text>}
    </Pressable>
  );
  const head = (t: string) => <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep, marginBottom: S.md }}>{t}</Text>;
  return (
    <View testID="site-footer" style={{ backgroundColor: colors.surface, paddingTop: wide ? 88 : 64, paddingBottom: bottomInset + 32, borderTopWidth: 1, borderColor: colors.border }}>
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 64 : 40 }}>
          <View style={{ flex: wide ? 1.2 : undefined }}>
            <Pressable onPress={() => (onNav ? onNav("home") : router.push("/"))} testID="footer-logo">
              <Image source={require("../../assets/images/logo-full.png")} style={{ width: 170, aspectRatio: 983 / 889 }} contentFit="contain" accessibilityLabel="Gold House Trading logo" />
            </Pressable>
            <Text style={{ fontFamily: F.serif, fontSize: 24, color: colors.onSurface, marginTop: S.lg }}>Gold House Trading</Text>
            <Text style={{ fontFamily: F.serifItal, fontSize: 19, color: colors.goldDeep }}>Welcome Home.</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted, marginTop: S.sm }}>Founded by Alysha Lee</Text>
          </View>
          <View style={{ flex: wide ? 1 : undefined }}>
            {head("LEGAL")}
            {LEGAL.map((l) => link(l.l, () => router.push(`/legal/${l.k}` as any), `footer-legal-${l.k}`))}
          </View>
          <View style={{ flex: wide ? 1 : undefined }}>
            {head("CONTACT")}
            {site?.contact_email ? link(site.contact_email, () => Linking.openURL(`mailto:${site.contact_email}`), "footer-email") : null}
            {site?.support_phone ? link(`Text ${site.support_phone}`, () => Linking.openURL(`sms:${site.support_phone.replace(/[^\d+]/g, "")}`), "footer-phone") : null}
            <View style={{ height: S.md }} />
            {socials.map((s) => link(s.l, () => Linking.openURL(s.u), `footer-social-${s.k}`))}
          </View>
        </View>
        <View style={{ marginTop: wide ? 72 : 48, paddingTop: S.xl, borderTopWidth: 1, borderColor: colors.divider, gap: S.md }}>
          <Text style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 19, color: colors.muted }}>
            Gold House Trading provides trading education only, not individualized investment advice. Trading leveraged gold, forex, and CFDs involves substantial risk and can result in the loss of some or all deposited capital. Past performance does not guarantee future results, and individual outcomes vary.
          </Text>
          <Text testID="footer-copyright" style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted }}>© {year} Esothrive LLC DBA Gold House Trading. All rights reserved.</Text>
          <Pressable testID="footer-admin-link" onPress={() => router.push("/admin" as any)} hitSlop={12} style={{ alignSelf: "flex-start", paddingVertical: 12, minHeight: 44, justifyContent: "center" }}>
            <Text style={{ fontFamily: F.sans, fontSize: 11, color: colors.border }}>Owner sign in</Text>
          </Pressable>
        </View>
      </Container>
    </View>
  );
}
