import React from "react";
import { View, Text } from "react-native";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, GoldRule, Reveal, useLayout } from "@/src/ui";

const BASICS = [
  { i: "sunrise", t: "We trade gold every morning", d: "Most mornings, I sit down with my laptop and trade gold (XAUUSD). That's it — no office, no trading floor, no fancy setup." },
  { i: "repeat", t: "It's not like typical stocks", d: "You're not buying shares and waiting years. Gold trades almost 24 hours a day, five days a week, so you can step in when your setup shows up — and you can trade whether price is going up or down." },
  { i: "trending-up", t: "Leverage changes the math", d: "Leverage lets you control a bigger position with a smaller amount of money. That's how a small account can make meaningful money on a winning trade — and it's also why losses grow just as fast. That's exactly why I teach risk first." },
  { i: "globe", t: "Work from anywhere", d: "As long as you have your laptop and Wi-Fi, you can trade from anywhere in the world. That's the part that gave me my freedom." },
];

export function WhatIsTrading() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surface} testID="what-is-trading-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 24 }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>Brand new? Start here</Eyebrow>
            <Display>WHAT IS TRADING, REALLY?</Display>
          </View>
          <View style={{ flex: wide ? 1 : undefined, gap: S.lg, paddingTop: wide ? 36 : 0 }}>
            <Lede>If you have no idea what trading even is, you&apos;re in the right place. Most of my students started exactly there.</Lede>
            <Body color={colors.muted}>Here&apos;s the simple version: trading is buying and selling based on where you think price is going next. We focus on one market — gold — and learn to read it really, really well.</Body>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: wide ? 64 : 40, marginHorizontal: -8 }}>
          {BASICS.map((b, i) => (
            <Reveal key={b.t} delay={i * 60} style={{ width: wide ? "50%" : "100%", padding: 8 }}>
              <View testID={`trading-basic-${i}`} style={{ borderTopWidth: 1, borderColor: colors.brand, paddingTop: S.xl, paddingBottom: S.lg, paddingRight: wide ? 32 : 0 }}>
                <Feather name={b.i as any} size={20} color={colors.brand} />
                <Text style={{ fontFamily: F.serif, fontSize: 26, color: colors.onSurface, marginTop: S.md, marginBottom: S.sm }}>{b.t}</Text>
                <Body size={15} color={colors.muted}>{b.d}</Body>
              </View>
            </Reveal>
          ))}
        </View>
        <View testID="trading-not-gambling" style={{ marginTop: wide ? 56 : 40, backgroundColor: colors.surfaceSecondary, padding: wide ? 40 : 24 }}>
          <Text style={{ fontFamily: F.serifItal, fontSize: wide ? 30 : 24, lineHeight: wide ? 38 : 31, color: colors.onSurface }}>Trading is not gambling, and it&apos;s not guessing.</Text>
          <Body style={{ marginTop: S.md }}>
            It&apos;s a skill. With time and practice, some traders build it into a full-time income — I did. But it takes work, and nobody can promise you that outcome. What I can promise is that I&apos;ll teach you everything I know, including the long-term trading plan: steady, consistent, and built around never over-risking your account.
          </Body>
        </View>
      </Container>
    </Section>
  );
}

const PATH = [
  { k: "01", t: "Finish the intensive", d: "Four weeks with me, learning the full framework, risk management, and your personal trading plan." },
  { k: "02", t: "Unlock the 10x account", d: "Graduates can use a 10x trading account. Deposit $500 and you can trade with $5,000 in capital every day." },
  { k: "03", t: "One main rule", d: "No complicated rule sheets. The one thing you can't do is lose 10% of the account — which is exactly what my risk plan is built to protect." },
  { k: "04", t: "Keep it steady", d: "Small, consistent, disciplined days. That's how you grow a skill — and an account — over the long term." },
];

export function SuccessPath() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surfaceInverse} testID="success-path-section">
      <Container>
        <Eyebrow color={colors.brand}>For my graduates</Eyebrow>
        <Display color={colors.onSurfaceInverse} style={{ maxWidth: 900 }}>THE SUCCESS PATH.</Display>
        <Lede color={colors.mutedInverse} style={{ marginTop: S.lg, maxWidth: 760 }}>
          When you graduate, you don&apos;t just get a certificate and a &ldquo;good luck.&rdquo; You get a clear next step.
        </Lede>
        <View style={{ flexDirection: wide ? "row" : "column", marginTop: wide ? 64 : 40, gap: wide ? 0 : 8 }}>
          {PATH.map((p, i) => (
            <Reveal key={p.k} delay={i * 80} style={{ flex: wide ? 1 : undefined }}>
              <View testID={`success-step-${i + 1}`} style={{ borderTopWidth: 1, borderColor: i === 1 ? colors.brand : colors.borderInverse, paddingTop: S.xl, paddingBottom: S.xl, paddingRight: wide ? 28 : 0 }}>
                <Text style={{ fontFamily: F.serifItal, fontSize: 20, color: colors.brand }}>{p.k}</Text>
                <Text style={{ fontFamily: F.serif, fontSize: 26, color: colors.onSurfaceInverse, marginTop: S.sm, marginBottom: S.sm }}>{p.t}</Text>
                <Body size={15} color={colors.mutedInverse}>{p.d}</Body>
              </View>
            </Reveal>
          ))}
        </View>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 48 : 20, marginTop: S.xl, alignItems: wide ? "center" : "flex-start" }}>
          <View testID="success-path-example" style={{ borderWidth: 1, borderColor: colors.brand, paddingVertical: S.lg, paddingHorizontal: S.xl }}>
            <Text style={{ fontFamily: F.serif, fontSize: wide ? 40 : 32, color: colors.onSurfaceInverse }}>$500 → $5,000</Text>
            <Text style={{ fontFamily: F.sansSemi, fontSize: 10, letterSpacing: 2.5, color: colors.brand, marginTop: 4 }}>DEPOSIT → TRADING CAPITAL (10X)</Text>
          </View>
          <View style={{ flex: wide ? 1 : undefined }}>
            <GoldRule width={32} style={{ marginBottom: S.md }} />
            <Body size={13} color={colors.mutedInverse}>
              More capital means bigger wins and bigger losses, so this path is only for graduates who&apos;ve learned the risk plan. What you make on a winning day depends on your position size and the market — results are never guaranteed, and you can lose the money you deposit.
            </Body>
          </View>
        </View>
      </Container>
    </Section>
  );
}
