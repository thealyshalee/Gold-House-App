import React, { useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Body, useLayout } from "@/src/ui";
import { Lightbox } from "@/src/home/Media";

const VALUES = [
  { key: "welcome-home", title: "Welcome Home", src: require("../../assets/images/values/welcome-home.jpg") },
  { key: "family", title: "Gold House Family", src: require("../../assets/images/values/gold-house-family.jpg") },
  { key: "promise", title: "My Promise to You", src: require("../../assets/images/values/my-promise.jpg") },
  { key: "protect", title: "Protect the House", src: require("../../assets/images/values/protect-the-house.jpg") },
  { key: "mindset", title: "Golden Mindset", src: require("../../assets/images/values/golden-mindset.jpg") },
  { key: "come-in", title: "Come On In", src: require("../../assets/images/values/come-on-in.jpg") },
];

export default function Values() {
  const { colors } = useTheme();
  const { wide, width } = useLayout();
  const ref = useRef<any>(null);
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState<number | null>(null);
  const cardW = wide ? 380 : Math.min(width * 0.8, 360);
  const gap = wide ? 24 : 16;
  const side = wide ? Math.max(56, (width - 1160) / 2) : 24;
  const step = cardW + gap;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / step);
    if (i !== active) setActive(Math.max(0, Math.min(VALUES.length - 1, i)));
  };
  const goTo = (i: number) => {
    const n = Math.max(0, Math.min(VALUES.length - 1, i));
    ref.current?.scrollTo({ x: n * step, animated: true });
    setActive(n);
  };

  return (
    <Section bg={colors.surfaceSecondary} testID="values-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", justifyContent: "space-between", alignItems: wide ? "flex-end" : "flex-start", gap: 24 }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>What I stand for</Eyebrow>
            <Display>WHAT THE HOUSE{"\n"}IS BUILT ON.</Display>
            <Body color={colors.muted} style={{ marginTop: S.lg, maxWidth: 520 }}>These are the letters I wrote about why Gold House exists and how I run it. Swipe through and read them — tap any one to open it full-size.</Body>
          </View>
          {wide ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["chevron-left", "chevron-right"] as const).map((ic, k) => (
                <Pressable key={ic} testID={`values-${k ? "next" : "prev"}`} onPress={() => goTo(active + (k ? 1 : -1))} accessibilityLabel={k ? "Next letter" : "Previous letter"}
                  style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.onSurface, alignItems: "center", justifyContent: "center" }}>
                  <Feather name={ic} size={18} color={colors.onSurface} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </Container>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingHorizontal: side, gap, paddingTop: wide ? 56 : 40 }}
        testID="values-carousel"
      >
        {VALUES.map((v, i) => (
          <Pressable key={v.key} testID={`value-card-${v.key}`} onPress={() => setLb(i)} accessibilityRole="imagebutton" accessibilityLabel={`Read ${v.title}`}>
            {({ pressed }) => (
              <View style={{ width: cardW, opacity: pressed ? 0.9 : 1 }}>
                <View style={{ backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, shadowColor: colors.onSurface, shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }}>
                  <Image source={v.src} style={{ width: cardW - 2, aspectRatio: 900 / 1124 }} contentFit="cover" transition={250} accessibilityLabel={v.title} />
                </View>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12, marginTop: S.md }}>
                  <Text style={{ fontFamily: F.serifItal, fontSize: 16, color: colors.goldDeep }}>0{i + 1}</Text>
                  <Text style={{ fontFamily: F.serif, fontSize: 22, color: colors.onSurface }}>{v.title}</Text>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: S.xl }} testID="values-dots">
        {VALUES.map((v, i) => (
          <Pressable key={v.key} onPress={() => goTo(i)} accessibilityLabel={`Go to letter ${i + 1}`} style={{ padding: 6 }}>
            <View style={{ width: i === active ? 24 : 8, height: 2, backgroundColor: i === active ? colors.brand : colors.border }} />
          </Pressable>
        ))}
      </View>
      <Lightbox items={VALUES.map((v) => ({ uri: "", source: v.src, width: 900, height: 1124, caption: v.title }))} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </Section>
  );
}
