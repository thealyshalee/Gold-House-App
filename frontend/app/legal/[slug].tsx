import React from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Head from "expo-router/head";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Container, Display, Body, GoldRule, Eyebrow } from "@/src/ui";
import { useSite } from "@/src/api";
import { Footer } from "@/src/home/Closing";
import { Brand } from "@/src/home/Nav";

export default function LegalPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: site, isLoading } = useSite();
  const doc = site?.legal?.[slug as string];

  const fill = (t: string) =>
    t
      .replace(/\{\{contact_email\}\}/g, site?.contact_email || "[contact email — set in admin]")
      .replace(/\{\{support_phone\}\}/g, site?.support_phone || "[support phone — set in admin]")
      .replace(/\{\{business_address\}\}/g, site?.business_address ? `Mailing address: ${site.business_address}` : "Mailing address available on request by email.");

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID={`legal-page-${slug}`}>
      <Head><title>{doc ? `${doc.title} | Gold House Trading` : "Gold House Trading"}</title></Head>
      <View style={{ paddingTop: insets.top, borderBottomWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface }}>
        <Container style={{ height: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Brand onPress={() => router.replace("/")} />
          <Pressable testID="legal-back-home" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 44 }}>
            <Feather name="arrow-left" size={16} color={colors.onSurface} />
            <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: colors.onSurface }}>Back</Text>
          </Pressable>
        </Container>
      </View>
      <ScrollView>
        <Container max={760} style={{ paddingVertical: 64 }}>
          {isLoading ? <ActivityIndicator color={colors.brand} /> : !doc ? (
            <View style={{ gap: 16 }}>
              <Display>Page not found.</Display>
              <Body>This page doesn&apos;t exist. Head back home to keep exploring.</Body>
            </View>
          ) : (
            <>
              <Eyebrow>Esothrive LLC DBA Gold House Trading</Eyebrow>
              <Display testID="legal-title">{doc.title}</Display>
              <GoldRule style={{ marginVertical: S.xl }} />
              {!doc.reviewed ? (
                <View testID="legal-review-note" style={{ backgroundColor: colors.surfaceSecondary, padding: 14, marginBottom: S.xl }}>
                  <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.muted }}>This document is currently under owner and legal review and may be updated.</Text>
                </View>
              ) : null}
              <View style={{ gap: S.lg }}>
                {fill(doc.body).split("\n").filter((p) => p.trim()).map((p, i) =>
                  p.startsWith("## ") ? (
                    <Text key={i} style={{ fontFamily: F.serif, fontSize: 26, color: colors.onSurface, marginTop: S.lg }}>{p.slice(3)}</Text>
                  ) : (
                    <Body key={i}>{p}</Body>
                  ),
                )}
              </View>
            </>
          )}
        </Container>
        <Footer site={site} bottomInset={insets.bottom} />
      </ScrollView>
    </View>
  );
}
