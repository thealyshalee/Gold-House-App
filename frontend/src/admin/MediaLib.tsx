import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Chip } from "@/src/ui";
import { api, resolveUrl } from "@/src/api";
import { SmallBtn, pickAndUpload, Uploaded } from "@/src/admin/kit";

const FOLDERS = [{ k: "headshots", l: "Headshots" }, { k: "lifestyle", l: "Lifestyle" }, { k: "students", l: "Student screenshots" }, { k: "brand", l: "Brand assets" }];

export default function MediaLib({ notify }: { notify: (m: string, e?: boolean) => void }) {
  const { colors } = useTheme();
  const [folder, setFolder] = useState("headshots");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["media", folder], queryFn: () => api<Uploaded[]>(`/admin/media?folder=${folder}`, { auth: true }) });

  const upload = async () => {
    setBusy(true);
    try {
      const m = await pickAndUpload(folder);
      if (m) {
        notify("Uploaded. Optimized web version created; original kept for full-size viewing.");
        refetch();
      }
    } catch (e: any) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    if (confirm !== id) return setConfirm(id);
    await api(`/admin/media/${id}`, { method: "DELETE", auth: true });
    setConfirm(null);
    refetch();
  };

  return (
    <View style={{ gap: S.lg }} testID="admin-media">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FOLDERS.map((f) => <Chip key={f.k} label={f.l} active={folder === f.k} onPress={() => setFolder(f.k)} testID={`media-folder-${f.k}`} />)}
      </View>
      <SmallBtn tone="dark" label={busy ? "Uploading…" : "Upload to this folder"} testID="media-upload" onPress={upload} icon={<Feather name="upload" size={14} color={colors.onBrandSecondary} />} />
      <Text style={{ fontFamily: F.sans, fontSize: 12, color: colors.muted }}>Use a file&apos;s link in Content → Photos & video. Student screenshots for the gallery are easiest to add from the Gallery tab.</Text>
      {isLoading ? <ActivityIndicator color={colors.brand} /> : !data?.length ? (
        <Text testID="media-empty" style={{ fontFamily: F.serifItal, fontSize: 20, color: colors.muted }}>Nothing in this folder yet.</Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {data.map((m) => (
            <View key={m.id} testID={`media-item-${m.id}`} style={{ width: 160, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: 8, gap: 6 }}>
              {m.kind === "image" ? <Image source={{ uri: resolveUrl(m.thumb_url) }} style={{ width: "100%", height: 160 }} contentFit="cover" /> : (
                <View style={{ height: 160, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceInverse }}><Feather name="video" size={24} color={colors.brand} /></View>
              )}
              <Text numberOfLines={1} style={{ fontFamily: F.sans, fontSize: 11, color: colors.muted }}>{m.filename}</Text>
              <Text selectable numberOfLines={2} style={{ fontFamily: F.sans, fontSize: 10, color: colors.onSurface }}>{m.url}</Text>
              <SmallBtn tone="danger" label={confirm === m.id ? "Confirm" : "Delete"} testID={`media-delete-${m.id}`} onPress={() => remove(m.id)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
