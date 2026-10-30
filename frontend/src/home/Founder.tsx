import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, Paras, GoldRule, Reveal, useLayout } from "@/src/ui";
import { Site, resolveUrl, useAdminPreview } from "@/src/api";
import { Video } from "@/src/home/Media";

const BIO = `Before I ever became a full-time trader, I learned what it meant to show up, stay disciplined, and work toward something bigger than myself.

From competing as a Division I athlete to building businesses and pursuing my acting career, I've always believed that the life you want is something you intentionally create.

Acting is my passion. I've been in four movies on Amazon Prime, and honestly, that's a big part of why I learned to trade. I wanted the freedom to act full-time — and to live life on my own terms. Now I get to teach other people how to do the same.

For me, trading was never just about the money. It was about freedom.

Freedom to pursue my passions. Freedom to travel. Freedom to build a life on my own terms.

When I began teaching, I knew I wanted to do things differently. No unnecessary complexity. No gatekeeping. No leaving students confused about what comes next.

I created Gold House Trading to teach people the skill, the structure, and the mindset behind trading — in a way that actually makes sense, even if they've never looked at a chart before.

My goal isn't to make students dependent on me. It's to give them the education and tools to become confident, independent traders.

Welcome Home.`;

const FACTS = [
  "Former Division I swimmer at Arizona State University",
  "Qualified for the U.S. Olympic Trials",
  "Spoken to audiences of 10,000+, here and abroad",
  "Actress — featured in 4 movies on Amazon Prime",
  "Entrepreneur and educator",
];
const POSITION = [
  "I'm the founder and the only trading coach at Gold House",
  "I lead every single live class myself",
  "You learn directly from me — never a team of strangers",
  "I teach you the whole framework, because my goal is your independence",
];

function PhotoPlaceholder({ label, ratio }: { label: string; ratio: number }) {
  const { colors } = useTheme();
  const preview = useAdminPreview();
  return (
    <View style={{ width: "100%", aspectRatio: ratio, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.divider, padding: 24 }}>
      <Image source={require("../../assets/images/logo-mark.png")} style={{ width: 96, height: 88, opacity: 0.6 }} contentFit="contain" />
      {preview ? <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted, marginTop: 12, textAlign: "center" }}>{label}</Text> : null}
    </View>
  );
}

export function MeetAlysha({ site }: { site?: Site }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const photo = resolveUrl(site?.founder_photo);
  return (
    <Section bg={colors.surfaceSecondary} testID="founder-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 40 }}>
          <Reveal style={{ flex: wide ? 0.85 : undefined }}>
            <View style={{ position: wide ? ("sticky" as any) : "relative", top: 100 }}>
              {photo ? (
                <Image testID="founder-photo" source={{ uri: photo }} style={{ width: "100%", aspectRatio: 958 / 1287 }} contentFit="cover" transition={400} accessibilityLabel="Alysha Lee, founder of Gold House Trading" />
              ) : (
                <PhotoPlaceholder ratio={4 / 5} label="Founder portrait — upload in Admin → Content" />
              )}
              <View style={{ marginTop: S.lg, gap: 8 }}>
                {FACTS.map((f) => (
                  <View key={f} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                    <GoldRule width={16} />
                    <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted, flex: 1 }}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Reveal>
          <Reveal delay={120} style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>Meet Your Coach</Eyebrow>
            <Display testID="founder-headline">MEET ALYSHA LEE.</Display>
            <Lede style={{ marginTop: S.md }}>Founder. Full-Time Trader. Your Personal Coach.</Lede>
            <GoldRule style={{ marginVertical: S.xl }} />
            <Paras text={BIO} />
            <Text style={{ fontFamily: F.serifItal, fontSize: 48, color: colors.goldDeep, marginTop: S.lg }}>— Alysha</Text>
            <View style={{ marginTop: S.xxl, backgroundColor: colors.surfaceTertiary, padding: wide ? 32 : 24, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
              <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep }}>WHO YOU&apos;LL LEARN FROM</Text>
              {POSITION.map((p) => (
                <View key={p} style={{ flexDirection: "row", gap: 12 }}>
                  <Feather name="check" size={16} color={colors.brand} style={{ marginTop: 3 }} />
                  <Body size={15} style={{ flex: 1 }}>{p}</Body>
                </View>
              ))}
              <Text style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 4 }}>
                I&apos;m a trading educator — not a licensed financial advisor, broker, or investment manager.
              </Text>
            </View>
          </Reveal>
        </View>
      </Container>
    </Section>
  );
}

const STORY = `Three years ago, I was sitting there crying after losing my last $5,000 in savings trying to make trading work.

I remember how defeated I felt. How badly I wanted this dream, and how far away it seemed.

What you see today — the freedom, the flexibility, the ability to trade full-time and pursue the things I love — didn't happen overnight.

There were losses. There were tears. There were moments I questioned everything.

But through it all, I trusted God.

Even when I couldn't see the bigger picture, I believed He was guiding me.

Eventually, He led me to the right mentor, and that guidance changed the direction of my trading journey.

I learned to stop chasing quick results and start focusing on discipline, structure, patience, and mastering the skill itself.

Today, I've been a full-time trader for a year.

And one of the most fulfilling parts of this journey is getting to turn what I've learned into something that can help other people.

That's why Gold House exists.

Because I remember what it felt like to be the beginner. To be overwhelmed. To want something so badly but not know how to get there.

I can't promise anyone an easy journey or guaranteed results. But I can promise that I care deeply about the education I provide and that I won't intentionally withhold the information I'm here to teach.

If you're at the beginning of your journey, I want you to know that you don't have to have everything figured out today.

You just have to be willing to learn, grow, and do the work.

Welcome Home.`;

const TIMELINE = [
  { k: "Then", t: "The Struggle", d: "Losing my savings, feeling defeated, and trying to understand the markets." },
  { k: "The Turning Point", t: "Faith & Mentorship", d: "Trusting God, finding the right mentor, and learning the importance of structure, discipline, and emotional control." },
  { k: "Now", t: "Purpose & Freedom", d: "One year as a full-time trader, pursuing my passions, and personally teaching students through Gold House Trading." },
];

export function Story({ site }: { site?: Site }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const preview = useAdminPreview();
  const video = resolveUrl(site?.story_video);
  const hasVideo = !!video;
  return (
    <Section bg={colors.surface} testID="story-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 40, alignItems: "flex-start" }}>
          {hasVideo || preview ? (
            <Reveal style={{ width: wide ? 400 : "100%" }}>
              <View style={{ position: wide ? ("sticky" as any) : "relative", top: 100, width: "100%", maxWidth: 420, alignSelf: "center" }}>
                {hasVideo ? (
                  <View style={{ borderWidth: 1, borderColor: colors.border, padding: 8, backgroundColor: colors.surfaceTertiary }}>
                    <Video uri={video} poster={resolveUrl(site?.story_video_poster)} aspect={9 / 16} testID="story-video" />
                  </View>
                ) : (
                  <View testID="story-video-placeholder" style={{ aspectRatio: 9 / 16, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand, alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <Feather name="video" size={28} color={colors.brand} />
                    <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 12 }}>Your story video goes here — visible only to you. Upload it in Admin → Content.</Text>
                  </View>
                )}
                <Text style={{ fontFamily: F.serifItal, fontSize: 17, lineHeight: 23, color: colors.muted, marginTop: S.md, textAlign: "center" }}>
                  Three years ago. One of the hardest moments of my trading journey.
                </Text>
              </View>
            </Reveal>
          ) : null}
          <Reveal delay={100} style={{ flex: wide ? 1 : undefined, maxWidth: hasVideo || preview ? undefined : 760, alignSelf: hasVideo || preview ? "auto" : "center" }}>
            <Eyebrow>The Story Behind Gold House</Eyebrow>
            <Display testID="story-headline">BEFORE THE FREEDOM, THERE WAS FAITH.</Display>
            <Lede style={{ marginTop: S.md }} color={colors.muted}>The part of my story you don&apos;t see on Instagram.</Lede>
            <GoldRule style={{ marginVertical: S.xl }} />
            <Paras text={STORY} />
            <Text style={{ fontFamily: F.serifItal, fontSize: 40, color: colors.goldDeep, marginTop: S.lg }}>— Alysha</Text>
          </Reveal>
        </View>

        <View testID="then-now-timeline" style={{ marginTop: wide ? 112 : 72 }}>
          <Eyebrow center>Then &amp; Now</Eyebrow>
          <View style={{ flexDirection: wide ? "row" : "column", marginTop: S.xl }}>
            {TIMELINE.map((m, i) => (
              <Reveal key={m.k} delay={i * 120} style={{ flex: 1, flexDirection: wide ? "column" : "row", gap: wide ? 0 : 20 }}>
                {wide ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: S.xl }}>
                    <View style={{ width: 11, height: 11, borderRadius: 6, borderWidth: 1, borderColor: colors.brand, backgroundColor: i === 2 ? colors.brand : colors.surface }} />
                    <View style={{ flex: 1, height: 1, backgroundColor: i < 2 ? colors.brand : "transparent" }} />
                  </View>
                ) : (
                  <View style={{ alignItems: "center", width: 12 }}>
                    <View style={{ width: 11, height: 11, borderRadius: 6, borderWidth: 1, borderColor: colors.brand, backgroundColor: i === 2 ? colors.brand : colors.surface, marginTop: 6 }} />
                    <View style={{ flex: 1, width: 1, backgroundColor: i < 2 ? colors.brand : "transparent" }} />
                  </View>
                )}
                <View style={{ flex: 1, paddingRight: wide ? 40 : 0, paddingBottom: wide ? 0 : 36 }}>
                  <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep }}>{m.k.toUpperCase()}</Text>
                  <Text style={{ fontFamily: F.serif, fontSize: 28, color: colors.onSurface, marginTop: 6, marginBottom: 8 }}>{m.t}</Text>
                  <Body size={15} color={colors.muted}>{m.d}</Body>
                </View>
              </Reveal>
            ))}
          </View>
        </View>

        <Reveal style={{ marginTop: wide ? 112 : 64, alignItems: "center", paddingVertical: wide ? 64 : 44, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }}>
          <Eyebrow center>The Reason Behind Gold House</Eyebrow>
          <Text testID="mentor-quote" style={{ fontFamily: F.serifItal, fontSize: wide ? 46 : 31, lineHeight: wide ? 56 : 39, color: colors.onSurface, textAlign: "center", maxWidth: 860 }}>
            &ldquo;I became the mentor I wish I had when I first started.&rdquo;
          </Text>
          <Text style={{ fontFamily: F.sansSemi, fontSize: 12, letterSpacing: 2.5, color: colors.goldDeep, marginTop: S.xl }}>— ALYSHA LEE</Text>
        </Reveal>
        <Text style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 19, color: colors.muted, textAlign: "center", marginTop: S.xl, maxWidth: 720, alignSelf: "center" }}>
          Faith is part of my personal foundation — Gold House welcomes students of every background and belief. My story is not a promise of results, and no one should ever risk savings they can&apos;t afford to lose.
        </Text>
      </Container>
    </Section>
  );
}
