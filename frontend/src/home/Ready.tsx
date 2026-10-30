import React from "react";
import { View, Text, Linking, Platform } from "react-native";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, Btn, GoldRule, useLayout } from "@/src/ui";
import { Site } from "@/src/api";

const DEFAULT_PHONE = "(602) 804-8859";

export function openReadyText(phone?: string) {
  const num = (phone || DEFAULT_PHONE).replace(/[^\d+]/g, "");
  const e164 = num.startsWith("+") ? num : `+1${num.replace(/^1/, "")}`;
  const body = encodeURIComponent("READY\nFull name: \nInstagram: @\nPAY UPFRONT or PAYMENT PLAN: ");
  Linking.openURL(`sms:${e164}${Platform.OS === "ios" ? "&" : "?"}body=${body}`).catch(() => {});
}

const STEPS = ["Your full name", "Your Instagram handle", "The word READY", "PAY UPFRONT or PAYMENT PLAN"];

export function ReadySection({ site }: { site?: Site }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const phone = site?.support_phone || DEFAULT_PHONE;
  return (
    <Section bg={colors.surfaceSecondary} testID="ready-section">
      <Container>
        <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 80 : 32, alignItems: wide ? "center" : "stretch" }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <Eyebrow>Already know this is for you?</Eyebrow>
            <Display>I&apos;M READY TO SECURE MY SPOT TODAY.</Display>
            <Lede style={{ marginTop: S.lg }}>If your heart is already saying yes, you don&apos;t have to wait. Text me directly.</Lede>
            <View style={{ marginTop: S.xl }}>
              <Btn label="I'm ready to secure my spot" icon="message-circle" testID="ready-text-button" onPress={() => openReadyText(phone)} full={!wide} />
            </View>
          </View>
          <View testID="ready-instructions" style={{ flex: wide ? 1 : undefined, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.brand, padding: wide ? 40 : 24 }}>
            <Text style={{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3, color: colors.goldDeep }}>TEXT</Text>
            <Text testID="ready-phone" onPress={() => openReadyText(phone)} accessibilityRole="link" style={{ fontFamily: F.serif, fontSize: wide ? 44 : 36, color: colors.onSurface, marginTop: 4, textDecorationLine: "underline", textDecorationColor: colors.brand }}>{phone}</Text>
            <GoldRule style={{ marginVertical: S.lg }} />
            <Body size={15} color={colors.muted}>Include:</Body>
            <View style={{ gap: 10, marginTop: S.sm }}>
              {STEPS.map((s, i) => (
                <View key={s} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <Text style={{ fontFamily: F.serifItal, fontSize: 17, color: colors.goldDeep, width: 22 }}>0{i + 1}</Text>
                  <Body size={15} style={{ flex: 1 }}>{s}</Body>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: S.xl, alignItems: "flex-start" }}>
              <Feather name="clock" size={15} color={colors.brand} style={{ marginTop: 3 }} />
              <Body size={14} style={{ flex: 1 }}>You&apos;ll hear back with the next openings and your next steps within 24–48 hours.</Body>
            </View>
          </View>
        </View>
      </Container>
    </Section>
  );
}
