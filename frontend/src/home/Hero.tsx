import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, Btn, GoldRule, Reveal, useLayout } from "@/src/ui";
import { Site, resolveUrl } from "@/src/api";
import type { Anchor } from "@/app/index";

export function Hero({ site, onNav }: { site?: Site; onNav: (k: Anchor) => void }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const photo = resolveUrl(site?.hero_photo);

  return (
    <Section bg={colors.surface} testID="hero-section" style={{ paddingTop: wide ? 112 : 56, paddingBottom: wide ? 120 : 72 }}>
      <Container max={photo ? 1160 : 860}>
        {site?.announcement ? (
          <View testID="hero-announcement" style={{ borderWidth: 1, borderColor: colors.brand, paddingVertical: 10, paddingHorizontal: 16, marginBottom: S.xxl, alignSelf: "center" }}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: colors.onSurface, textAlign: "center" }}>{site.announcement}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: wide && photo ? "row" : "column", gap: wide ? 72 : 40, alignItems: "center" }}>
          <Reveal style={{ flex: wide && photo ? 1.1 : undefined, alignItems: photo && wide ? "flex-start" : "center", width: "100%" }}>
            <Eyebrow center={!(photo && wide)}>Gold trading with Alysha Lee</Eyebrow>
            <Display size={wide ? 58 : 36} center={!(photo && wide)} testID="hero-headline" style={{ letterSpacing: 2 }}>WELCOME HOME.</Display>
            <GoldRule center={!(photo && wide)} style={{ marginVertical: S.xl }} />
            <Lede center={!(photo && wide)} style={{ maxWidth: 600 }}>Learn the skill. Master your mindset. Build a life of freedom.</Lede>
            <Body center={!(photo && wide)} style={{ marginTop: S.lg, maxWidth: 600 }}>
              Hi, I&apos;m Alysha. Gold House is where I teach beginners how to trade gold — simply, honestly, and without holding anything back. No gatekeeping and no fluff. Just the skills, structure, and mindset I wish someone had handed me when I first started.
            </Body>
            <View style={{ flexDirection: wide ? "row" : "column", gap: S.md, marginTop: S.xxl, alignSelf: wide ? (photo ? "flex-start" : "center") : "stretch" }}>
              <Btn label="Join the Waitlist" testID="hero-join-waitlist-button" onPress={() => onNav("waitlist")} full={!wide} />
              <Btn label="See Student Results" variant="outline" testID="hero-see-results-button" onPress={() => onNav("results")} full={!wide} />
            </View>
            <View style={{ marginTop: S.xxl, paddingTop: S.lg, borderTopWidth: 1, borderColor: colors.divider, alignSelf: "stretch" }}>
              <Text testID="hero-brand-statement" style={{ fontFamily: F.sansMed, fontSize: 12, letterSpacing: 1.2, color: colors.muted, lineHeight: 20, textAlign: photo && wide ? "left" : "center" }}>
                {wide ? "Founded by Alysha Lee  |  Gold Trading Education  |  Four-Week Intensive" : "Founded by Alysha Lee\nGold Trading Education  |  Four-Week Intensive"}
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18, textAlign: photo && wide ? "left" : "center" }}>
                I&apos;m an educator — not a broker, signal service, or money manager.
              </Text>
            </View>
          </Reveal>
          {photo ? (
            <Reveal delay={150} style={{ flex: wide ? 0.9 : undefined, width: "100%" }}>
              <Image source={{ uri: photo }} style={{ width: "100%", aspectRatio: 4 / 5 }} contentFit="cover" transition={400} accessibilityLabel="Alysha Lee" testID="hero-photo" />
            </Reveal>
          ) : null}
        </View>
      </Container>
    </Section>
  );
}

const PILLARS = [
  { t: "Simplicity", d: "I keep it clear and structured. One approach, taught step by step, without the clutter that makes beginners want to quit." },
  { t: "Transparency", d: "I don't hide the important parts. No secret indicators, no withheld details, and no upselling you on the basics." },
  { t: "Discipline", d: "Before we ever talk about profit, we talk about risk, patience, and staying calm. That's what actually lasts." },
  { t: "Freedom", d: "I want you walking away with a skill you can take anywhere — one that can give you more flexibility over time." },
];

export function Philosophy() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surfaceSecondary} testID="philosophy-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 24 }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>What I believe</Eyebrow>
            <Display>TRADING IS THE SKILL.{"\n"}FREEDOM IS THE VISION.</Display>
          </View>
          <View style={{ flex: wide ? 1 : undefined, gap: S.lg, paddingTop: wide ? 36 : 0 }}>
            <Body>For me, trading was never about staring at charts all day or chasing some flashy lifestyle. It&apos;s about building a skill that gives you more ownership over your time, your choices, and your future.</Body>
            <Body>I truly believe this kind of education should be accessible and honest. You shouldn&apos;t have to spend years confused, buried in indicators, or trying to decode a complicated strategy just to understand what the market is doing.</Body>
            <Body>So that&apos;s what I do. I simplify it, I teach you what actually matters, and I help you build the confidence and discipline to make your own decisions.</Body>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: wide ? 88 : 56, marginHorizontal: -12 }}>
          {PILLARS.map((p, i) => (
            <Reveal key={p.t} delay={i * 80} style={{ width: wide ? "25%" : "100%", paddingHorizontal: 12, marginBottom: wide ? 0 : 32 }}>
              <View testID={`pillar-${p.t.toLowerCase()}`} style={{ borderTopWidth: 1, borderColor: colors.brand, paddingTop: S.xl }}>
                <Text style={{ fontFamily: F.serifItal, fontSize: 20, color: colors.goldDeep }}>0{i + 1}</Text>
                <Text style={{ fontFamily: F.sansSemi, fontSize: 13, letterSpacing: 3, color: colors.onSurface, marginTop: S.md, marginBottom: S.sm }}>{p.t.toUpperCase()}</Text>
                <Body size={15} color={colors.muted}>{p.d}</Body>
              </View>
            </Reveal>
          ))}
        </View>
      </Container>
    </Section>
  );
}
