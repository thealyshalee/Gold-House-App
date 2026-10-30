import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, useWindowDimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S } from "@/src/ui";

export const RESULTS_DISCLOSURE =
  "Individual trading results are not typical or guaranteed. Trading involves substantial risk, and past performance does not predict future results. Screenshots reflect individual experiences and may not represent all students.";

export function Video({ uri, poster, aspect = 9 / 16, testID }: { uri: string; poster?: string; aspect?: number; testID?: string }) {
  const { colors } = useTheme();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });
  const [started, setStarted] = useState(false);
  return (
    <View testID={testID} style={{ width: "100%", aspectRatio: aspect, backgroundColor: colors.surfaceInverse, overflow: "hidden" }}>
      <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="contain" nativeControls={started} />
      {!started ? (
        <Pressable
          testID={testID ? `${testID}-play` : undefined}
          accessibilityRole="button"
          accessibilityLabel="Play video"
          onPress={() => {
            setStarted(true);
            player.play();
          }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}
        >
          {poster ? <Image source={{ uri: poster }} style={{ position: "absolute", width: "100%", height: "100%" }} contentFit="cover" /> : null}
          <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: colors.brand, backgroundColor: "rgba(36,33,30,0.55)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="play" size={24} color={colors.onSurfaceInverse} style={{ marginLeft: 3 }} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

export type LightItem = { uri: string; width?: number | null; height?: number | null; caption?: string; disclosure?: boolean; source?: any };

export function Lightbox({ items, index, onClose, onIndex }: { items: LightItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const [zoom, setZoom] = useState(1);
  useEffect(() => setZoom(1), [index]);
  if (index == null || !items[index]) return null;
  const it = items[index];
  const ratio = it.width && it.height ? it.width / it.height : 0.6;
  const availH = H - insets.top - insets.bottom - 180;
  const baseW = Math.min(W - 32, availH * ratio, 900);
  const imgW = baseW * zoom;
  const imgH = imgW / ratio;
  const btn = (icon: any, onPress: () => void, testID: string, disabled?: boolean) => (
    <Pressable testID={testID} onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.borderInverse, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.3 : 1 }}>
      <Feather name={icon} size={18} color={colors.onSurfaceInverse} />
    </Pressable>
  );
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View testID="lightbox" style={{ flex: 1, backgroundColor: colors.scrim, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, height: 52 }}>
          <Text style={{ fontFamily: F.sansMed, fontSize: 12, letterSpacing: 2, color: colors.mutedInverse }}>{index + 1} / {items.length}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {btn("zoom-out", () => setZoom((z) => Math.max(1, z - 1)), "lightbox-zoom-out", zoom === 1)}
            {btn("zoom-in", () => setZoom((z) => Math.min(3, z + 1)), "lightbox-zoom-in", zoom === 3)}
            {btn("x", onClose, "lightbox-close")}
          </View>
        </View>
        <ScrollView horizontal style={{ flex: 1 }} contentContainerStyle={{ minWidth: W, alignItems: "center", justifyContent: "center" }} showsHorizontalScrollIndicator={zoom > 1}>
          <ScrollView contentContainerStyle={{ minHeight: availH + 40, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}
            maximumZoomScale={Platform.OS === "ios" ? 4 : undefined} minimumZoomScale={1}>
            <Pressable onPress={() => setZoom((z) => (z === 1 ? 2 : 1))} testID="lightbox-image">
              <Image source={it.source ?? { uri: it.uri }} style={{ width: imgW, height: imgH }} contentFit="contain" transition={200} accessibilityLabel={it.caption || "Full-size image"} />
            </Pressable>
          </ScrollView>
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {btn("chevron-left", () => onIndex(index - 1), "lightbox-prev", index === 0)}
            <Text style={{ flex: 1, fontFamily: F.serifItal, fontSize: 18, lineHeight: 24, color: colors.onSurfaceInverse, textAlign: "center" }}>{it.caption}</Text>
            {btn("chevron-right", () => onIndex(index + 1), "lightbox-next", index === items.length - 1)}
          </View>
          {it.disclosure ? <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 16, color: colors.mutedInverse, textAlign: "center" }}>{RESULTS_DISCLOSURE}</Text> : null}
          <Text style={{ fontFamily: F.sans, fontSize: 11, color: colors.mutedInverse, textAlign: "center", marginTop: S.xs }}>Tap the image to zoom</Text>
        </View>
      </View>
    </Modal>
  );
}
