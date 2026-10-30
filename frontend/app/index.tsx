import React, { useCallback, useRef } from "react";
import { View, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Head from "expo-router/head";

import { useTheme } from "@/src/theme";
import { useSite, useTestimonials } from "@/src/api";
import Nav, { NAV_H } from "@/src/home/Nav";
import { Hero, Philosophy } from "@/src/home/Hero";
import Results from "@/src/home/Results";
import { MeetAlysha, Story } from "@/src/home/Founder";
import Values from "@/src/home/Values";
import { Different, SmallCohort, Intensive, ContinuedEducation, Referral, Commitment, WhoFor, Vision } from "@/src/home/Program";
import Waitlist from "@/src/home/Waitlist";
import { FaqSection, FinalCta, Footer } from "@/src/home/Closing";
import { WhatIsTrading, SuccessPath } from "@/src/home/Learn";

export type Anchor = "home" | "results" | "founder" | "intensive" | "waitlist";
const ORDER = ["home", "philosophy", "whatis", "results", "founder", "story", "values", "different", "small", "intensive", "continued", "success", "referral", "commitment", "whofor", "vision", "waitlist"];

export default function Home() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<any>(null);
  const pos = useRef<Record<string, number>>({});
  const site = useSite().data;
  const testimonials = useTestimonials();

  // Section offsets are derived from measured heights (web onLayout only fires on size changes, not moves).
  const yOf = (key: string) => {
    let y = 0;
    for (const k of ORDER) {
      if (k === key) return y;
      y += pos.current[k] ?? 0;
    }
    return y;
  };
  const go = useCallback((key: Anchor) => {
    scrollRef.current?.scrollTo({ y: key === "home" ? 0 : yOf(key), animated: true });
  }, []);
  const mark = (key: string) => (e: LayoutChangeEvent) => {
    pos.current[key] = e.nativeEvent.layout.height;
  };


  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="home-screen">
      <Head>
        <title>Gold House Trading | Gold Trading Education by Alysha Lee</title>
        <meta name="description" content="Learn gold trading with Alysha Lee at Gold House Trading. Explore real student experiences, a beginner-friendly four-week intensive, and upcoming cohorts." />
        <meta property="og:title" content="Gold House Trading | Gold Trading Education by Alysha Lee" />
        <meta property="og:description" content="A beginner-friendly four-week gold (XAUUSD) trading intensive taught personally by Alysha Lee. Welcome Home." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Nav onNav={go} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        bottomOffset={32}
        contentContainerStyle={{ paddingTop: insets.top + NAV_H }}
        testID="home-scroll"
      >
        <View onLayout={mark("home")}><Hero site={site} onNav={go} /></View>
        <View onLayout={mark("philosophy")}><Philosophy /></View>
        <View onLayout={mark("whatis")}><WhatIsTrading /></View>
        <View onLayout={mark("results")}><Results site={site} query={testimonials} /></View>
        <View onLayout={mark("founder")}><MeetAlysha site={site} /></View>
        <View onLayout={mark("story")}><Story site={site} /></View>
        <View onLayout={mark("values")}><Values /></View>
        <View onLayout={mark("different")}><Different /></View>
        <View onLayout={mark("small")}><SmallCohort /></View>
        <View onLayout={mark("intensive")}><Intensive site={site} /></View>
        <View onLayout={mark("continued")}><ContinuedEducation /></View>
        <View onLayout={mark("success")}><SuccessPath /></View>
        <View onLayout={mark("referral")}><Referral onNav={go} /></View>
        <View onLayout={mark("commitment")}><Commitment /></View>
        <View onLayout={mark("whofor")}><WhoFor /></View>
        <View onLayout={mark("vision")}><Vision site={site} onNav={go} /></View>
        <View onLayout={mark("waitlist")}><Waitlist site={site} onSuccess={() => go("waitlist")} /></View>
        <FaqSection site={site} />
        <FinalCta onNav={go} />
        <Footer site={site} onNav={go} bottomInset={insets.bottom} />
      </KeyboardAwareScrollView>
    </View>
  );
}
