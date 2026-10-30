import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Feather from "@react-native-vector-icons/feather";
import { UseQueryResult } from "@tanstack/react-query";
import { useTheme } from "@/src/theme";
import { F, S, Container, Section, Eyebrow, Display, Lede, Body, Chip, Btn, Reveal, useLayout } from "@/src/ui";
import { Site, Testimonial, resolveUrl, useAdminPreview } from "@/src/api";
import { Lightbox, Video, RESULTS_DISCLOSURE } from "@/src/home/Media";

const FILTERS = [
  { key: "all", label: "All Results" },
  { key: "trading", label: "Trading Results" },
  { key: "testimonial", label: "Student Testimonials" },
  { key: "progress", label: "Student Progress" },
] as const;

export default function Results({ site, query }: { site?: Site; query: UseQueryResult<Testimonial[]> }) {
  const { colors } = useTheme();
  const { wide, width } = useLayout();
  const preview = useAdminPreview();
  const [filter, setFilter] = useState<string>("all");
  const [limit, setLimit] = useState(wide ? 12 : 8);
  const [lb, setLb] = useState<number | null>(null);

  const items = useMemo(() => (query.data ?? []).filter((t) => filter === "all" || t.category === filter), [query.data, filter]);
  const shown = items.slice(0, limit);
  const images = shown.filter((t) => t.kind === "image");
  const cols = width >= 1100 ? 4 : width >= 700 ? 3 : 2;
  const columns = useMemo(() => {
    const c: Testimonial[][] = Array.from({ length: cols }, () => []);
    const h = Array(cols).fill(0);
    shown.forEach((t) => {
      const i = h.indexOf(Math.min(...h));
      c[i].push(t);
      h[i] += t.kind === "quote" ? 0.9 : t.width && t.height ? t.height / t.width : 1.7;
    });
    return c;
  }, [shown, cols]);
  const hasTrading = shown.some((t) => t.category === "trading");

  return (
    <Section bg={colors.surface} testID="results-section">
      <Container>
        <Reveal>
          <Eyebrow>My students</Eyebrow>
          <Display style={{ maxWidth: 820 }}>THE RESULTS SPEAK FOR THEMSELVES.</Display>
          <Lede style={{ marginTop: S.lg }}>Real students. Real experiences. Real progress.</Lede>
          <Body style={{ marginTop: S.lg, maxWidth: 640 }} color={colors.muted}>
            I can tell you what I teach, but I&apos;d rather show you what my students have learned and accomplished. At Gold House, the goal is to develop traders who can think, analyze, and execute independently.
          </Body>
        </Reveal>

        {site?.featured_quote ? (
          <Reveal style={{ marginTop: wide ? 72 : 48, paddingVertical: wide ? 56 : 36, paddingHorizontal: wide ? 72 : 24, backgroundColor: colors.surfaceSecondary }}>
            <Text style={{ fontFamily: F.serifItal, fontSize: 96, lineHeight: 80, color: colors.brand, height: 56 }}>&ldquo;</Text>
            <Text testID="featured-testimonial-quote" style={{ fontFamily: F.serifItal, fontSize: wide ? 38 : 27, lineHeight: wide ? 48 : 35, color: colors.onSurface }}>{site.featured_quote}</Text>
            {site.featured_name ? <Text style={{ fontFamily: F.sansSemi, fontSize: 12, letterSpacing: 2.5, color: colors.goldDeep, marginTop: S.xl }}>— {site.featured_name.toUpperCase()}</Text> : null}
          </Reveal>
        ) : preview ? (
          <View testID="featured-placeholder" style={{ marginTop: 48, padding: 32, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand }}>
            <Text style={{ fontFamily: F.serifItal, fontSize: 22, color: colors.muted }}>Featured testimonial — visible only to you. Add an authentic quote in Admin → Content to publish it.</Text>
          </View>
        ) : null}
      </Container>

      <View style={{ height: 56, marginTop: wide ? 64 : 40 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: wide ? Math.max(56, (width - 1160) / 2) : 24, alignItems: "center" }}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} active={filter === f.key} testID={`results-filter-${f.key}`} onPress={() => { setFilter(f.key); setLimit(wide ? 12 : 8); }} />
          ))}
        </ScrollView>
      </View>

      <Container style={{ marginTop: S.xl }}>
        {query.isLoading ? (
          <ActivityIndicator color={colors.brand} style={{ marginVertical: 64 }} />
        ) : query.isError ? (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 16 }}>
            <Body color={colors.muted}>We couldn&apos;t load student results right now.</Body>
            <Btn small variant="outline" label="Try again" testID="results-retry" onPress={() => query.refetch()} />
          </View>
        ) : shown.length === 0 ? (
          preview ? (
            <View testID="results-placeholder" style={{ padding: 32, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand }}>
              <Text style={{ fontFamily: F.serifItal, fontSize: 20, color: colors.muted }}>No published items in this category yet — visible only to you. Upload and publish from Admin → Gallery.</Text>
            </View>
          ) : null
        ) : (
          <View style={{ flexDirection: "row", gap: wide ? 20 : 12 }} testID="results-gallery">
            {columns.map((col, ci) => (
              <View key={ci} style={{ flex: 1, gap: wide ? 20 : 12 }}>
                {col.map((t) => (
                  <Tile key={t.id} t={t} onOpen={() => setLb(images.findIndex((x) => x.id === t.id))} />
                ))}
              </View>
            ))}
          </View>
        )}
        {items.length > shown.length ? (
          <View style={{ alignItems: "center", marginTop: S.xxl }}>
            <Btn variant="outline" label={`View more (${items.length - shown.length})`} testID="results-view-more" onPress={() => setLimit((l) => l + (wide ? 12 : 8))} />
          </View>
        ) : null}
        {shown.length > 0 && (hasTrading || filter === "all") ? (
          <Text testID="results-disclosure" style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: S.xxl, maxWidth: 760, alignSelf: "center", textAlign: "center" }}>
            {RESULTS_DISCLOSURE} Student names and details are shared with permission and may be partially hidden for privacy.
          </Text>
        ) : null}
      </Container>
      <Lightbox
        items={images.map((t) => ({ uri: resolveUrl(t.media_url), width: t.width, height: t.height, caption: t.caption, disclosure: t.category === "trading" }))}
        index={lb}
        onClose={() => setLb(null)}
        onIndex={setLb}
      />
    </Section>
  );
}

function Tile({ t, onOpen }: { t: Testimonial; onOpen: () => void }) {
  const { colors } = useTheme();
  const tag = { trading: "Trading Result", testimonial: "Testimonial", progress: "Progress" }[t.category];
  const meta = (
    <View style={{ paddingTop: 10, gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {t.highlighted ? <Feather name="star" size={11} color={colors.brand} /> : null}
        <Text style={{ fontFamily: F.sansSemi, fontSize: 10, letterSpacing: 2, color: colors.goldDeep }}>{tag.toUpperCase()}</Text>
      </View>
      {t.caption ? <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 19, color: colors.onSurface }}>{t.caption}</Text> : null}
      {t.student_name ? <Text style={{ fontFamily: F.sansMed, fontSize: 12, color: colors.muted }}>— {t.student_name}</Text> : null}
    </View>
  );
  if (t.kind === "quote") {
    return (
      <View testID={`result-tile-${t.id}`} style={{ backgroundColor: colors.surfaceSecondary, padding: 20, borderTopWidth: 1, borderColor: colors.brand }}>
        <Text style={{ fontFamily: F.serifItal, fontSize: 20, lineHeight: 27, color: colors.onSurface }}>&ldquo;{t.quote}&rdquo;</Text>
        {meta}
      </View>
    );
  }
  if (t.kind === "video") {
    return (
      <View testID={`result-tile-${t.id}`}>
        <Video uri={resolveUrl(t.media_url)} poster={t.thumb_url && t.thumb_url !== t.media_url ? resolveUrl(t.thumb_url) : undefined} aspect={t.width && t.height ? t.width / t.height : 9 / 16} testID={`result-video-${t.id}`} />
        {meta}
      </View>
    );
  }
  return (
    <Pressable testID={`result-tile-${t.id}`} onPress={onOpen} accessibilityRole="imagebutton" accessibilityLabel={`Open ${t.caption || "student result"}`}>
      {({ pressed, hovered }: any) => (
        <View style={{ opacity: pressed ? 0.85 : 1 }}>
          <View style={{ borderWidth: t.highlighted ? 1 : 0, borderColor: colors.brand, padding: t.highlighted ? 4 : 0 }}>
            <Image source={{ uri: resolveUrl(t.thumb_url || t.media_url) }} style={{ width: "100%", aspectRatio: t.width && t.height ? t.width / t.height : 0.6, backgroundColor: colors.surfaceInverse, transform: [{ scale: hovered ? 1.01 : 1 }] }} contentFit="cover" transition={300} recyclingKey={t.id} />
          </View>
          {meta}
        </View>
      )}
    </Pressable>
  );
}
