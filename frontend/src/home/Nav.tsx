import React, { useState } from "react";
import { View, Pressable, Text, Modal } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, useLayout, Btn, GoldRule } from "@/src/ui";
import type { Anchor } from "@/app/index";

export const NAV_H = 68;
const LINKS: { key: Anchor; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "founder", label: "Meet Your Coach" },
  { key: "results", label: "Student Results" },
  { key: "intensive", label: "The Intensive" },
];

export function Brand({ onPress, light }: { onPress?: () => void; light?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable testID="nav-brand" onPress={onPress} accessibilityRole="link" accessibilityLabel="Gold House Trading home" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Image source={require("../../assets/images/logo-mark.png")} style={{ width: 40, height: 37 }} contentFit="contain" accessibilityLabel="Gold House Trading logo" />
      <View>
        <Text style={{ fontFamily: F.serifSemi, fontSize: 18, letterSpacing: 1.6, color: light ? colors.onSurfaceInverse : colors.onSurface }}>GOLD HOUSE</Text>
        <Text style={{ fontFamily: F.sansMed, fontSize: 8, letterSpacing: 4.5, color: colors.goldDeep, marginTop: -1 }}>TRADING</Text>
      </View>
    </Pressable>
  );
}

export default function Nav({ onNav }: { onNav: (k: Anchor) => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { wide, pad } = useLayout();
  const [open, setOpen] = useState(false);
  const go = (k: Anchor) => {
    setOpen(false);
    setTimeout(() => onNav(k), open ? 250 : 0);
  };

  return (
    <View testID="site-nav" style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.divider }}>
      <View style={{ height: NAV_H, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wide ? pad : 20, maxWidth: 1160 + pad * 2, width: "100%", alignSelf: "center" }}>
        <Brand onPress={() => go("home")} />
        {wide ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 32 }}>
            {LINKS.map((l) => (
              <Pressable key={l.key} testID={`nav-link-${l.key}`} onPress={() => go(l.key)} accessibilityRole="link">
                {({ hovered }: any) => (
                  <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: hovered ? colors.goldDeep : colors.onSurface }}>{l.label}</Text>
                )}
              </Pressable>
            ))}
            <Btn small label="Join the Waitlist" testID="nav-waitlist-button" onPress={() => go("waitlist")} />
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
            <Btn small label="Waitlist" testID="nav-waitlist-button" onPress={() => go("waitlist")} />
            <Pressable testID="nav-menu-button" onPress={() => setOpen(true)} accessibilityLabel="Open menu" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Feather name="menu" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
        )}
      </View>

      <Modal visible={open} animationType="fade" transparent={false} onRequestClose={() => setOpen(false)}>
        <View testID="mobile-menu" style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
          <View style={{ height: NAV_H, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 }}>
            <Brand onPress={() => go("home")} />
            <Pressable testID="mobile-menu-close" onPress={() => setOpen(false)} accessibilityLabel="Close menu" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Feather name="x" size={24} color={colors.onSurface} />
            </Pressable>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40, gap: 8 }}>
            {LINKS.map((l, i) => (
              <Pressable key={l.key} testID={`mobile-link-${l.key}`} onPress={() => go(l.key)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.divider, flexDirection: "row", alignItems: "baseline", gap: 16 }}>
                <Text style={{ fontFamily: F.serifItal, fontSize: 16, color: colors.goldDeep }}>0{i + 1}</Text>
                <Text style={{ fontFamily: F.serif, fontSize: 34, color: colors.onSurface }}>{l.label}</Text>
              </Pressable>
            ))}
            <View style={{ marginTop: 32 }}>
              <Btn full label="Join the Waitlist" testID="mobile-menu-waitlist" onPress={() => go("waitlist")} />
            </View>
          </View>
          <View style={{ alignItems: "center", gap: 12 }}>
            <GoldRule center width={40} />
            <Text style={{ fontFamily: F.serifItal, fontSize: 18, color: colors.muted }}>Welcome Home.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
