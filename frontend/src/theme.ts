// Design tokens for Gold House Trading (light editorial theme). Keys match design_guidelines.json.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FAF8F3", // warm ivory
  onSurface: "#30251C", // rich espresso
  surfaceSecondary: "#F2EDE4", // soft cream
  onSurfaceSecondary: "#30251C",
  surfaceTertiary: "#FFFFFF", // cards & fields
  onSurfaceTertiary: "#30251C",
  surfaceInverse: "#24211E", // deep charcoal
  onSurfaceInverse: "#FAF8F3",
  muted: "#756D65",
  mutedInverse: "#B9AE9F",

  brand: "#C4A16A", // champagne gold
  onBrand: "#30251C",
  brandPrimary: "#C4A16A",
  onBrandPrimary: "#30251C",
  brandSecondary: "#30251C", // espresso
  onBrandSecondary: "#FAF8F3",
  brandTertiary: "#D8CCBB", // soft taupe
  onBrandTertiary: "#30251C",
  goldDeep: "#9C7A45",

  success: "#4A5D23",
  onSuccess: "#FFFFFF",
  warning: "#9C7A45",
  onWarning: "#FFFFFF",
  error: "#8B3A3A",
  onError: "#FFFFFF",
  info: "#4A6274",
  onInfo: "#FFFFFF",

  border: "#D8CCBB",
  borderStrong: "#C4A16A",
  divider: "#E4DACB",
  borderInverse: "#3D3731",
  scrim: "rgba(20,17,14,0.94)",
};

export type ThemeColors = typeof light;
export const defaultScheme = "light" satisfies ColorScheme;
export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };
export const colors = light;

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}
setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = (system === "light" || system === "dark") && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
