import React, { useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, GoldRule, Btn, Reveal, Accordion, useLayout } from "@/src/ui";
import { Site, resolveUrl } from "@/src/api";
import type { Anchor } from "@/app/index";
import { openReadyText } from "@/src/home/Ready";

const TYPICAL = ["Overwhelming amounts of information.", "Too many strategies and indicators.", "Little personalized accountability.", "Learning without a clear structure.", "Confusing explanations for beginners.", "Students left to figure everything out alone."];
const GH = ["One clearly defined core strategy.", "Simple lessons, step by step.", "You learn directly from me — no assistants, no anonymous team.", "Live classes with me every week.", "Daily chart analysis and journaling.", "Homework and real accountability.", "A community of students who genuinely support each other.", "Risk management first, and learning to make your own decisions."];

export function Different() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surface} testID="different-section">
      <Container>
        <Eyebrow>Why Gold House Is Different</Eyebrow>
        <Display style={{ maxWidth: 960 }}>NO GATEKEEPING. NO UNNECESSARY COMPLICATIONS. JUST REAL EDUCATION.</Display>
        <Body style={{ marginTop: S.xl, maxWidth: 680 }} color={colors.muted}>
          I&apos;ll be honest with you — there is so much noise in this industry. Conflicting strategies, endless indicators, expensive upsells, and &ldquo;education&rdquo; that leaves beginners more confused than when they started. I know, because I lived it.{"\n\n"}So when I built Gold House, I built it to be the opposite of all that.
        </Body>
        <View style={{ flexDirection: wide ? "row" : "column", marginTop: wide ? 72 : 48, gap: wide ? 0 : 24 }}>
          <View style={{ flex: 1, padding: wide ? 40 : 24, borderWidth: 1, borderColor: colors.border }} testID="comparison-typical">
            <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.muted }}>WHAT I SEE OUT THERE</Text>
            <View style={{ marginTop: S.xl, gap: 14 }}>
              {TYPICAL.map((t) => (
                <View key={t} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                  <View style={{ width: 12, height: 1, backgroundColor: colors.muted }} />
                  <Body size={15} color={colors.muted} style={{ flex: 1 }}>{t}</Body>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 1, padding: wide ? 40 : 24, backgroundColor: colors.surfaceInverse }} testID="comparison-goldhouse">
            <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.brand }}>HOW I DO IT AT GOLD HOUSE</Text>
            <View style={{ marginTop: S.xl, gap: 14 }}>
              {GH.map((t) => (
                <View key={t} style={{ flexDirection: "row", gap: 14 }}>
                  <Feather name="check" size={15} color={colors.brand} style={{ marginTop: 4 }} />
                  <Body size={15} color={colors.onSurfaceInverse} style={{ flex: 1 }}>{t}</Body>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Container>
    </Section>
  );
}

export function SmallCohort() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const reasons = [
    { t: "You get my real attention", d: "With a small group, I actually know your name, your charts, and where you're getting stuck. Nobody falls through the cracks." },
    { t: "Your questions get answered", d: "Live classes stay personal. You can raise your hand, share your screen, and get help in the moment — not lost in a chat of hundreds." },
    { t: "The right people in the room", d: "I hand-pick every student so the group shares the same values and is here for the right reasons. That's what makes it feel like family." },
  ];
  return (
    <Section bg={colors.surfaceInverse} testID="small-cohort-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 32 }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow color={colors.brand}>Why I teach the way I teach</Eyebrow>
            <Display color={colors.onSurfaceInverse}>I KEEP IT SMALL ON PURPOSE.</Display>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12, marginTop: S.xxl }}>
              <Text testID="cohort-size" style={{ fontFamily: F.serif, fontSize: wide ? 88 : 64, color: colors.brand }}>6–12</Text>
              <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 2.5, color: colors.mutedInverse, flexShrink: 1 }}>HAND-PICKED STUDENTS{"\n"}EACH MONTH</Text>
            </View>
          </View>
          <View style={{ flex: wide ? 1 : undefined, gap: S.lg }}>
            <Lede color={colors.onSurfaceInverse}>I only take 6 to 12 carefully hand-picked students each month — so every single person gets my quality attention.</Lede>
            <Body color={colors.mutedInverse}>I could teach hundreds of people at once. But I remember what it felt like to be one face in a huge course, too nervous to ask a question and quietly falling behind. I never want that for my students.</Body>
            <View style={{ marginTop: S.md, borderTopWidth: 1, borderColor: colors.borderInverse }}>
              {reasons.map((r) => (
                <View key={r.t} style={{ paddingVertical: S.lg, borderBottomWidth: 1, borderColor: colors.borderInverse }}>
                  <Text style={{ fontFamily: F.serif, fontSize: 22, color: colors.onSurfaceInverse, marginBottom: 4 }}>{r.t}</Text>
                  <Body size={15} color={colors.mutedInverse}>{r.d}</Body>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Container>
    </Section>
  );
}

const BENEFITS = [
  { i: "video", t: "Live Weekly Classes", d: "Every Monday for four weeks, I teach you live on Zoom. It's me, in real time, answering your questions." },
  { i: "bar-chart-2", t: "Daily Market Breakdowns", d: "On trading days I share my gold analysis, chart markups, and what I'm noticing — so you can see how I think, not just what I do." },
  { i: "layers", t: "A Complete Trading Framework", d: "I walk you through market structure, key levels, entries and exits, and how to build a process you can repeat on your own." },
  { i: "edit-3", t: "Homework & Accountability", d: "Assignments, journaling, chart markups, and practice exercises. This is where the lessons actually start to click." },
  { i: "users", t: "Private Student Community", d: "You'll be surrounded by people on the same journey — sharing charts, asking questions, and cheering each other on." },
  { i: "book-open", t: "Class Recordings & Resources", d: "Every class is recorded, and I give you the materials to go back and review whenever you need a refresher." },
];

export function Intensive({ site }: { site?: Site }) {
  const { colors } = useTheme();
  const { wide, width } = useLayout();
  const [open, setOpen] = useState<number | null>(0);
  const cols = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  return (
    <Section bg={colors.surfaceSecondary} testID="intensive-section">
      <Container>
        <Eyebrow>The Four-Week Gold House Intensive</Eyebrow>
        <Display style={{ maxWidth: 1000 }}>FOUR WEEKS. ONE FOUNDATION. A SKILL YOU CAN CONTINUE BUILDING FOR LIFE.</Display>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 20, marginTop: S.xl }}>
          <Lede style={{ flex: wide ? 1 : undefined }}>Designed for complete beginners and aspiring traders who are ready to stop guessing and start learning with structure.</Lede>
          <Body style={{ flex: wide ? 1 : undefined }} color={colors.muted}>
            This is a four-week live intensive, and I teach every class myself. We focus on gold (XAUUSD) — market structure, technical analysis, disciplined execution, and the mindset side of trading that nobody talks about enough. My goal is simple: by the end, you have a repeatable framework you can keep practicing on your own.
          </Body>
        </View>
        {site?.cohort_dates ? (
          <View testID="cohort-info" style={{ marginTop: S.xxl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: S.lg }}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: colors.onSurface }}><Text style={{ color: colors.goldDeep }}>NEXT COHORT  </Text>{site.cohort_dates}</Text>
          </View>
        ) : null}
        {site?.price ? <Pricing site={site} /> : null}

        <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep, marginTop: wide ? 80 : 56, marginBottom: S.xl }}>WHAT&apos;S INCLUDED</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 }}>
          {BENEFITS.map((b, i) => (
            <Reveal key={b.t} delay={i * 60} style={{ width: `${100 / cols}%` as any, padding: 8 }}>
              <View testID={`benefit-${i}`} style={{ backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: wide ? 32 : 24, minHeight: wide ? 250 : undefined }}>
                <Feather name={b.i as any} size={20} color={colors.brand} />
                <Text style={{ fontFamily: F.serif, fontSize: 25, lineHeight: 30, color: colors.onSurface, marginTop: S.xl, marginBottom: S.sm }}>{b.t}</Text>
                <Body size={15} color={colors.muted}>{b.d}</Body>
              </View>
            </Reveal>
          ))}
        </View>

        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 24, marginTop: wide ? 96 : 64 }}>
          <View style={{ flex: wide ? 0.7 : undefined }}>
            <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep, marginBottom: S.lg }}>FOUR-WEEK CURRICULUM</Text>
            <Display size={wide ? 44 : 32}>Built for beginners. Rooted in discipline.</Display>
            <Body size={14} color={colors.muted} style={{ marginTop: S.lg }}>Here&apos;s what we cover each week. The full framework and its exact rules, I teach live inside the intensive.</Body>
          </View>
          <View style={{ flex: wide ? 1 : undefined, borderTopWidth: 1, borderColor: colors.border }} testID="curriculum-accordion">
            {(site?.curriculum ?? []).map((w, i) => (
              <Accordion key={i} title={w.title} open={open === i} onToggle={() => setOpen(open === i ? null : i)} testID={`curriculum-week-${i + 1}`}>
                <View style={{ gap: 10 }}>
                  {w.items.map((it) => (
                    <View key={it} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                      <GoldRule width={14} />
                      <Body size={15} style={{ flex: 1 }}>{it}</Body>
                    </View>
                  ))}
                </View>
              </Accordion>
            ))}
          </View>
        </View>
      </Container>
    </Section>
  );
}

export function Referral({ onNav }: { onNav: (k: Anchor) => void }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surfaceSecondary} testID="referral-section" style={{ paddingVertical: wide ? 96 : 64 }}>
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 28, alignItems: wide ? "center" : "stretch" }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>Referral Program</Eyebrow>
            <Display>SHARE THE HOUSE.</Display>
            <Lede style={{ marginTop: S.lg }}>Know someone who would love this? Bring them home.</Lede>
            <Body style={{ marginTop: S.lg }} color={colors.muted}>
              Some of my favorite students came from someone who believed in them. So for every student you refer, I&apos;ll send you a $100 commission once your referral pays. Just ask them to put your name in the &ldquo;Who referred you?&rdquo; box when they join the waitlist.
            </Body>
            <View style={{ marginTop: S.xl }}>
              <Btn variant="outline" label="Go to the waitlist" icon="arrow-right" testID="referral-waitlist-button" onPress={() => onNav("waitlist")} />
            </View>
          </View>
          <View testID="referral-amount-card" style={{ flex: wide ? 0.7 : undefined, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.brand, padding: wide ? 48 : 28, alignItems: "center" }}>
            <Text style={{ fontFamily: F.serif, fontSize: wide ? 96 : 72, color: colors.onSurface }}>$100</Text>
            <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep, textAlign: "center" }}>FOR EVERY STUDENT YOU REFER</Text>
            <GoldRule center style={{ marginVertical: S.lg }} />
            <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 20, color: colors.muted, textAlign: "center" }}>Paid to you once your referral pays.</Text>
          </View>
        </View>
      </Container>
    </Section>
  );
}

export function Commitment() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surface} testID="commitment-section" style={{ paddingVertical: wide ? 96 : 64 }}>
      <Container max={900}>
        <View style={{ borderLeftWidth: 1, borderColor: colors.brand, paddingLeft: wide ? 48 : 24 }}>
          <Eyebrow>Student Expectations</Eyebrow>
          <Display size={wide ? 48 : 34}>YOUR COMMITMENT MATTERS.</Display>
          <Body style={{ marginTop: S.xl }}>
            I&apos;m going to pour everything I have into teaching you. All I ask is that you meet me halfway — participate, practice, ask questions, and take this seriously.
          </Body>
          <Lede style={{ marginTop: S.lg }}>Come prepared. Show up. Complete the assignments. Journal your progress. Engage with your classmates. And most importantly, give yourself permission to be a beginner.</Lede>
          <Body size={14} color={colors.muted} style={{ marginTop: S.lg }}>
            I&apos;d love for you to join live and keep your camera on when you can — it makes such a difference. Life happens, though, so if you miss a class, the recording will be there for you. Just know that your progress comes from your practice; I can&apos;t promise income or profits to anyone.
          </Body>
        </View>
      </Container>
    </Section>
  );
}

function Pricing({ site }: { site: Site }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const plan = (site.payment_plan || "").split("\n").filter((l) => l.trim());
  return (
    <View testID="pricing-block" style={{ flexDirection: wide ? "row" : "column", marginTop: wide ? 64 : 48 }}>
      <View style={{ flex: wide ? 1 : undefined, backgroundColor: colors.surfaceInverse, padding: wide ? 48 : 28 }}>
        <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.brand }}>YOUR INVESTMENT</Text>
        <Text testID="pricing-amount" style={{ fontFamily: F.serif, fontSize: wide ? 80 : 60, color: colors.onSurfaceInverse, marginTop: S.md }}>{site.price}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 14, color: colors.mutedInverse }}>For the full four-week intensive with me</Text>
        {site.price_note ? (
          <View testID="pricing-note" style={{ marginTop: S.xl, borderLeftWidth: 1, borderColor: colors.brand, paddingLeft: 14 }}>
            <Text style={{ fontFamily: F.serifItal, fontSize: 19, lineHeight: 26, color: colors.onSurfaceInverse }}>{site.price_note}</Text>
          </View>
        ) : null}
        <View style={{ marginTop: S.xl }}>
          <Btn variant="gold" label="Secure my spot" icon="message-circle" testID="pricing-ready-button" onPress={() => openReadyText(site.support_phone)} full={!wide} />
        </View>
      </View>
      {plan.length ? (
        <View testID="payment-plan" style={{ flex: wide ? 1 : undefined, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: wide ? 48 : 28 }}>
          <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep }}>PAYMENT PLAN OPTION</Text>
          <Text style={{ fontFamily: F.serif, fontSize: wide ? 30 : 26, color: colors.onSurface, marginTop: S.md, marginBottom: S.md }}>Need to spread it out? Just ask.</Text>
          <Body size={15} color={colors.muted}>If a payment plan would help, you can request one. It&apos;s a contract directly between you and me, and it&apos;s offered when approved. Here&apos;s what you can expect:</Body>
          <View style={{ gap: 12, marginTop: S.lg }}>
            {plan.map((l, idx) => (
              <View key={`${idx}-${l}`} style={{ flexDirection: "row", gap: 12 }}>
                <Feather name="check" size={15} color={colors.brand} style={{ marginTop: 4 }} />
                <Body size={15} style={{ flex: 1 }}>{l}</Body>
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: S.lg }}>By choosing a payment plan, you agree to all of the contract terms.</Text>
        </View>
      ) : null}
    </View>
  );
}

const FOR = ["You've never placed a trade in your life.", "You've tried learning before and felt completely overwhelmed.", "You want a clear, repeatable structure instead of guessing.", "You're craving more flexibility and freedom in your life.", "You're willing to practice and build real discipline.", "You already trade, but want a stronger foundation in gold."];

export function ContinuedEducation() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const items = [
    { i: "message-circle", tag: "Optional · Paid membership", t: "My Discord Community", d: "When you finish the intensive, you can join my paid Discord community. I post my trade breakdowns there every trading day — what I saw, why I took a trade (or didn't), and how it played out. It's the best way I know to keep learning, compare your analysis with mine, and keep refining the strategy with other students." },
    { i: "phone-call", tag: "After the intensive · Fee applies", t: "1-on-1 Calls With Me", d: "If you want more personal time after the four weeks, you can book a private call with me. We can go through your journal, your charts, your trades — whatever you need to feel more confident on your own. These sessions have a separate fee and are only for students who've completed the intensive." },
  ];
  return (
    <Section bg={colors.surface} testID="continued-education-section">
      <Container>
        <Eyebrow>After the Four Weeks</Eyebrow>
        <Display style={{ maxWidth: 900 }}>CONTINUED EDUCATION.</Display>
        <Lede style={{ marginTop: S.lg, maxWidth: 760 }}>Four weeks gives you the foundation. What you do next is where the skill really grows — and I don&apos;t want you to feel like you&apos;re on your own once class ends.</Lede>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 24 : 16, marginTop: wide ? 56 : 40 }}>
          {items.map((it, k) => (
            <View key={it.t} testID={`continued-${k ? "coaching" : "discord"}`} style={{ flex: wide ? 1 : undefined, backgroundColor: k ? colors.surfaceSecondary : colors.surfaceInverse, padding: wide ? 40 : 24 }}>
              <Feather name={it.i as any} size={22} color={colors.brand} />
              <Text style={{ fontFamily: F.sansSemi, fontSize: 10, letterSpacing: 2.5, color: colors.brand, marginTop: S.xl }}>{it.tag.toUpperCase()}</Text>
              <Text style={{ fontFamily: F.serif, fontSize: wide ? 34 : 28, color: k ? colors.onSurface : colors.onSurfaceInverse, marginTop: S.sm, marginBottom: S.md }}>{it.t}</Text>
              <Body size={15} color={k ? colors.muted : colors.mutedInverse}>{it.d}</Body>
            </View>
          ))}
        </View>
        <Body size={13} color={colors.muted} style={{ marginTop: S.xl, maxWidth: 760 }}>Both are completely optional — the intensive stands on its own. I share membership and call pricing with students as they finish the four weeks. My breakdowns are educational, never signals or advice to copy.</Body>
      </Container>
    </Section>
  );
}

export function WhoFor() {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Section bg={colors.surfaceSecondary} testID="whofor-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 32 }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>This is for you if…</Eyebrow>
            <Display>YOU DON&apos;T NEED EXPERIENCE. YOU NEED A WILLINGNESS TO LEARN.</Display>
            <Lede style={{ marginTop: S.xl }} color={colors.goldDeep}>You don&apos;t need a finance degree, any trading experience, or a fancy setup. I&apos;ll meet you exactly where you are.</Lede>
          </View>
          <View style={{ flex: wide ? 1 : undefined }}>
            {FOR.map((f, i) => (
              <View key={f} style={{ flexDirection: "row", gap: 20, paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border, borderTopWidth: i === 0 ? 1 : 0 }}>
                <Text style={{ fontFamily: F.serifItal, fontSize: 17, color: colors.goldDeep, width: 24 }}>0{i + 1}</Text>
                <Body style={{ flex: 1 }}>{f}</Body>
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 12, marginTop: S.xl }}>
              <Feather name="monitor" size={16} color={colors.brand} style={{ marginTop: 4 }} />
              <Body size={14} color={colors.muted} style={{ flex: 1 }}>All you&apos;ll need is reliable internet and a laptop or computer for charting. Your phone is handy for staying in touch with me and the group.</Body>
            </View>
          </View>
        </View>
      </Container>
    </Section>
  );
}

export function Vision({ site, onNav }: { site?: Site; onNav: (k: Anchor) => void }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const photo = resolveUrl(site?.lifestyle_photo);
  return (
    <Section bg={colors.surfaceInverse} testID="vision-section" style={{ paddingVertical: 0 }}>
      <View style={{ flexDirection: wide ? "row" : "column" }}>
        {photo ? (
          <View style={{ flex: wide ? 1 : undefined }}>
            <Image source={{ uri: photo }} style={{ width: "100%", height: wide ? "100%" : undefined, aspectRatio: wide ? undefined : 1320 / 1401, minHeight: wide ? 640 : undefined }} contentFit="cover" contentPosition="top" transition={400} accessibilityLabel="Alysha Lee traveling" testID="vision-photo" />
          </View>
        ) : null}
        <View style={{ flex: 1, paddingHorizontal: wide ? 80 : 24, paddingVertical: wide ? 120 : 72, justifyContent: "center" }}>
          <Eyebrow color={colors.brand}>The Vision of Freedom</Eyebrow>
          <Display color={colors.onSurfaceInverse}>THE GOAL WAS NEVER TO JUST TRADE. THE GOAL WAS TO LIVE.</Display>
          <GoldRule style={{ marginVertical: S.xl }} />
          <View style={{ gap: S.lg }}>
            <Lede color={colors.onSurfaceInverse}>Imagine developing a skill that isn&apos;t tied to one office, one city, or one employer.</Lede>
            <Body color={colors.mutedInverse}>For me, trading opened the door to a different kind of lifestyle — one where I could pursue acting, travel, build businesses, and have more control over my schedule.</Body>
            <Body color={colors.mutedInverse}>That&apos;s the bigger vision behind Gold House.</Body>
            <Body color={colors.mutedInverse}>Trading isn&apos;t a shortcut to wealth. It&apos;s a skill that requires patience, discipline, and consistent work. But for those willing to learn and grow, it can become one tool in building a life with greater freedom.</Body>
          </View>
          <View style={{ marginTop: S.xxl }}>
            <Btn variant="outlineLight" label="Start Your Journey" icon="arrow-right" testID="vision-start-journey-button" onPress={() => onNav("waitlist")} />
          </View>
        </View>
      </View>
    </Section>
  );
}
