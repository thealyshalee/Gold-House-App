import React from "react";
import { View, Text, TextInput, Pressable, Switch } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/src/theme";
import { F } from "@/src/ui";
import { BASE, getToken, ApiError } from "@/src/api";
import { uploadForm } from "@/src/utils/upload";

export function Field({ label, value, onChange, testID, multiline, placeholder, hint, secure, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void; testID: string; multiline?: boolean; placeholder?: string; hint?: string; secure?: boolean; keyboardType?: any;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: colors.onSurface }}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={secure || keyboardType === "email-address" ? "none" : "sentences"}
        style={{ minHeight: multiline ? 120 : 48, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceTertiary, paddingHorizontal: 12, paddingVertical: multiline ? 10 : 0, fontFamily: F.sans, fontSize: 15, color: colors.onSurface, textAlignVertical: multiline ? "top" : "center" }}
      />
      {hint ? <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted }}>{hint}</Text> : null}
    </View>
  );
}

export function Toggle({ label, value, onChange, testID, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; testID: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: colors.onSurface }}>{label}</Text>
        {hint ? <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      <Switch testID={testID} value={value} onValueChange={onChange} trackColor={{ true: colors.brand, false: colors.border }} thumbColor={colors.surfaceTertiary} />
    </View>
  );
}

export function Card({ children, title, testID }: { children: React.ReactNode; title?: string; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={{ backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 16 }}>
      {title ? <Text style={{ fontFamily: F.serif, fontSize: 24, color: colors.onSurface }}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function SmallBtn({ label, onPress, testID, tone = "default", icon }: { label: string; onPress: () => void; testID: string; tone?: "default" | "danger" | "dark"; icon?: React.ReactNode }) {
  const { colors } = useTheme();
  const bg = tone === "dark" ? colors.brandSecondary : "transparent";
  const fg = tone === "dark" ? colors.onBrandSecondary : tone === "danger" ? colors.error : colors.onSurface;
  const bd = tone === "danger" ? colors.error : tone === "dark" ? colors.brandSecondary : colors.border;
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: bd, backgroundColor: bg, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, opacity: pressed ? 0.7 : 1 })}>
      {icon}
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: fg }}>{label}</Text>
    </Pressable>
  );
}

export type Uploaded = { id: string; kind: "image" | "video"; url: string; thumb_url: string; width?: number; height?: number; filename: string; folder: string; created_at: string };

export async function pickAndUpload(folder: string, types: ("images" | "videos")[] = ["images", "videos"]): Promise<Uploaded | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: types, quality: 1, allowsEditing: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  const isVideo = a.type === "video";
  const token = await getToken();
  const r = await uploadForm(`${BASE}/api/admin/upload`, {
    headers: { Authorization: `Bearer ${token}` },
    fields: { folder },
    files: { file: { uri: a.uri, name: a.fileName ?? (isVideo ? "video.mp4" : "photo.jpg"), mimeType: a.mimeType ?? (isVideo ? "video/mp4" : "image/jpeg") } },
  });
  if (!r.ok) {
    let msg = "Upload failed. Please try again.";
    try {
      const d = await r.json();
      if (typeof d.detail === "string") msg = d.detail;
    } catch {}
    throw new ApiError(msg, r.status);
  }
  const doc = (await r.json()) as Uploaded;
  return { ...doc, width: doc.width ?? a.width, height: doc.height ?? a.height };
}
