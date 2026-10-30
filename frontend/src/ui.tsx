import React from "react";
import { Pressable, Text, View, useWindowDimensions, StyleProp, TextStyle, ViewStyle, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";

export const F = {
  serif: "CG500", serifReg: "CG400", serifSemi: "CG600", serifItal: "CG400i", serifItalMed: "CG500i",
  sans: "Inter400", sansMed: "Inter500", sansSemi: "Inter600",
};
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const wide = width >= 900;
  return { width, height, wide, pad: wide ? 56 : 24, section: wide ? 120 : 80 };
}

export function Container({ children, style, max = 1160 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; max?: number }) {
  const { pad } = useLayout();
  return <View style={[{ width: "100%", maxWidth: max + pad * 2, alignSelf: "center", paddingHorizontal: pad }, style]}>{children}</View>;
}

export function Section({ children, bg, testID, style }: { children: React.ReactNode; bg?: string; testID?: string; style?: StyleProp<ViewStyle> }) {
  const { section } = useLayout();
  return (
    <View testID={testID} style={[{ backgroundColor: bg, paddingVertical: section }, style]}>
      {children}
    </View>
  );
}

export function Eyebrow({ children, color, center, style }: { children: React.ReactNode; color?: string; center?: boolean; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontFamily: F.sansSemi, fontSize: 11, letterSpacing: 3.2, textTransform: "uppercase", color: color ?? colors.goldDeep, marginBottom: S.lg, textAlign: center ? "center" : "left" }, style]}>
      {children}
    </Text>
  );
}

export function Display({ children, size, color, center, style, testID }: { children: React.ReactNode; size?: number; color?: string; center?: boolean; style?: StyleProp<TextStyle>; testID?: string }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const fs = size ?? (wide ? 56 : 38);
  return (
    <Text testID={testID} accessibilityRole="header" style={[{ fontFamily: F.serif, fontSize: fs, lineHeight: Math.round(fs * 1.14), color: color ?? colors.onSurface, letterSpacing: 0.3, textAlign: center ? "center" : "left" }, style]}>
      {children}
    </Text>
  );
}

export function Lede({ children, color, center, style }: { children: React.ReactNode; color?: string; center?: boolean; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  return (
    <Text style={[{ fontFamily: F.serifItal, fontSize: wide ? 26 : 22, lineHeight: wide ? 34 : 29, color: color ?? colors.onSurface, textAlign: center ? "center" : "left" }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, color, size = 16, center, style }: { children: React.ReactNode; color?: string; size?: number; center?: boolean; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return <Text style={[{ fontFamily: F.sans, fontSize: size, lineHeight: size * 1.7, color: color ?? colors.onSurface, textAlign: center ? "center" : "left" }, style]}>{children}</Text>;
}

export function Paras({ text, color, size, gap = S.lg, center }: { text: string; color?: string; size?: number; gap?: number; center?: boolean }) {
  return (
    <View style={{ gap }}>
      {text.split("\n\n").map((p, i) => (
        <Body key={i} color={color} size={size} center={center}>
          {p}
        </Body>
      ))}
    </View>
  );
}

export function GoldRule({ width = 56, center, style }: { width?: number; center?: boolean; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ width, height: 1, backgroundColor: colors.brand, alignSelf: center ? "center" : "flex-start" }, style]} />;
}

type BtnVariant = "primary" | "gold" | "outline" | "outlineLight";
export function Btn({ label, onPress, variant = "primary", testID, icon, loading, disabled, full, small }: {
  label: string; onPress?: () => void; variant?: BtnVariant; testID?: string; icon?: any; loading?: boolean; disabled?: boolean; full?: boolean; small?: boolean;
}) {
  const { colors } = useTheme();
  const v = {
    primary: { bg: colors.brandSecondary, fg: colors.onBrandSecondary, bd: colors.brandSecondary },
    gold: { bg: colors.brand, fg: colors.onBrand, bd: colors.brand },
    outline: { bg: "transparent", fg: colors.onSurface, bd: colors.onSurface },
    outlineLight: { bg: "transparent", fg: colors.onSurfaceInverse, bd: colors.brand },
  }[variant];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered }: any) => ({
        height: small ? 40 : 52, paddingHorizontal: small ? 16 : 28, borderWidth: 1, borderColor: v.bd, backgroundColor: v.bg,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, alignSelf: full ? "stretch" : "flex-start",
        opacity: disabled ? 0.5 : pressed ? 0.75 : hovered ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : (
        <>
          <Text style={{ fontFamily: F.sansSemi, fontSize: small ? 11 : 12, letterSpacing: 2, textTransform: "uppercase", color: v.fg }}>{label}</Text>
          {icon ? <Feather name={icon} size={14} color={v.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(800).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}

export function Chip({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{ height: 36, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, flexShrink: 0, justifyContent: "center",
        borderColor: active ? colors.brandSecondary : colors.border, backgroundColor: active ? colors.brandSecondary : "transparent" }}
    >
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: active ? colors.onBrandSecondary : colors.onSurface }}>{label}</Text>
    </Pressable>
  );
}

export function Accordion({ title, children, testID, open, onToggle, dark }: { title: string; children: React.ReactNode; testID?: string; open: boolean; onToggle: () => void; dark?: boolean }) {
  const { colors } = useTheme();
  const { wide } = useLayout();
  const fg = dark ? colors.onSurfaceInverse : colors.onSurface;
  return (
    <View style={{ borderBottomWidth: 1, borderColor: dark ? colors.borderInverse : colors.border }}>
      <Pressable testID={testID} onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }}
        style={{ minHeight: 64, paddingVertical: S.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: S.lg }}>
        <Text style={{ flex: 1, fontFamily: F.serif, fontSize: wide ? 26 : 21, lineHeight: wide ? 32 : 27, color: fg }}>{title}</Text>
        <Feather name={open ? "minus" : "plus"} size={18} color={colors.brand} />
      </Pressable>
      {open ? <Animated.View entering={FadeInDown.duration(300)} style={{ paddingBottom: S.xl }}>{children}</Animated.View> : null}
    </View>
  );
}
