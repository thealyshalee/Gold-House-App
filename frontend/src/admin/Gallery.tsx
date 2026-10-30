import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Feather from "@react-native-vector-icons/feather";
import { useTheme } from "@/src/theme";
import { F, S, Chip } from "@/src/ui";
import { api, Testimonial, resolveUrl } from "@/src/api";
import { Card, Field, Toggle, SmallBtn, pickAndUpload } from "@/src/admin/kit";

const EMPTY: Partial<Testimonial> = { kind: "image", category: "trading", media_url: "", thumb_url: "", caption: "", student_name: "", quote: "", description: "", featured: false, highlighted: false, status: "draft", permission_confirmed: false };

export default function Gallery({ notify }: { notify: (m: string, e?: boolean) => void }) {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => api<Testimonial[]>("/admin/testimonials", { auth: true }) });
  const [edit, setEdit] = useState<Partial<Testimonial> | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  const refresh = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ["testimonials"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const save = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      const body = { ...EMPTY, ...edit };
      delete (body as any).id; delete (body as any).order; delete (body as any).created_at; delete (body as any).updated_at; delete (body as any).seed_key; delete (body as any).deleted;
      if (edit.id) await api(`/admin/testimonials/${edit.id}`, { method: "PUT", body, auth: true });
      else await api("/admin/testimonials", { method: "POST", body, auth: true });
      notify(body.status === "published" ? "Saved and published." : "Saved as draft.");
      setEdit(null);
      refresh();
    } catch (e: any) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  };
  const upload = async () => {
    try {
      setBusy(true);
      const m = await pickAndUpload("students", edit?.kind === "video" ? ["videos"] : ["images"]);
      if (m) setEdit((s) => ({ ...s, media_url: m.url, thumb_url: m.kind === "image" ? m.thumb_url : "", width: m.width, height: m.height, kind: m.kind }));
    } catch (e: any) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  };
  const move = async (i: number, d: number) => {
    if (!data) return;
    const ids = data.map((t) => t.id);
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await api("/admin/testimonials/reorder", { method: "POST", body: { ids }, auth: true });
    refresh();
  };
  const quick = async (t: Testimonial, patch: Partial<Testimonial>) => {
    try {
      const body: any = { ...EMPTY, ...t, ...patch };
      ["id", "order", "created_at", "updated_at", "seed_key", "deleted"].forEach((k) => delete body[k]);
      await api(`/admin/testimonials/${t.id}`, { method: "PUT", body, auth: true });
      notify("Gallery updated.");
      refresh();
    } catch (e: any) {
      notify(e.message, true);
    }
  };
  const remove = async (id: string) => {
    if (confirm !== id) return setConfirm(id);
    await api(`/admin/testimonials/${id}`, { method: "DELETE", auth: true });
    setConfirm(null);
    notify("Item removed from the gallery.");
    refresh();
  };

  if (edit) {
    const set = (k: keyof Testimonial, v: any) => setEdit((s) => ({ ...s, [k]: v }));
    return (
      <Card title={edit.id ? "Edit gallery item" : "New gallery item"} testID="gallery-editor">
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: colors.onSurface }}>Type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["image", "video", "quote"] as const).map((k) => <Chip key={k} label={k === "image" ? "Screenshot" : k === "video" ? "Video" : "Written quote"} active={edit.kind === k} onPress={() => set("kind", k)} testID={`editor-kind-${k}`} />)}
        </View>
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: colors.onSurface }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["trading", "testimonial", "progress"] as const).map((k) => <Chip key={k} label={k === "trading" ? "Trading result" : k === "testimonial" ? "Testimonial" : "Progress"} active={edit.category === k} onPress={() => set("category", k)} testID={`editor-category-${k}`} />)}
        </View>
        {edit.kind !== "quote" ? (
          <View style={{ gap: 8 }}>
            {edit.media_url ? (
              edit.kind === "image" ? <Image source={{ uri: resolveUrl(edit.thumb_url || edit.media_url) }} style={{ width: 160, aspectRatio: edit.width && edit.height ? edit.width / edit.height : 0.6, backgroundColor: colors.surfaceInverse }} contentFit="cover" />
                : <Text style={{ fontFamily: F.sans, fontSize: 13, color: colors.success }}>Video attached ✓</Text>
            ) : null}
            <SmallBtn label={busy ? "Uploading…" : edit.media_url ? "Replace file" : `Upload ${edit.kind === "video" ? "video" : "screenshot"}`} testID="editor-upload" onPress={upload} icon={<Feather name="upload" size={14} color={colors.onSurface} />} />
          </View>
        ) : (
          <Field label="Student quote" value={edit.quote || ""} onChange={(v) => set("quote", v)} testID="editor-quote" multiline />
        )}
        <Field label="Caption" value={edit.caption || ""} onChange={(v) => set("caption", v)} testID="editor-caption" hint="A short line shown under the item." />
        <Field label="Student name or initials (optional)" value={edit.student_name || ""} onChange={(v) => set("student_name", v)} testID="editor-name" />
        <Field label="Result / milestone description (optional)" value={edit.description || ""} onChange={(v) => set("description", v)} testID="editor-description" />
        <Toggle label="Feature at the top" value={!!edit.featured} onChange={(v) => set("featured", v)} testID="editor-featured" />
        <Toggle label="Highlight with gold frame" value={!!edit.highlighted} onChange={(v) => set("highlighted", v)} testID="editor-highlighted" />
        <Toggle label="I have the student's permission to publish this" value={!!edit.permission_confirmed} onChange={(v) => set("permission_confirmed", v)} testID="editor-permission" hint="Required before publishing." />
        <Toggle label="Published" value={edit.status === "published"} onChange={(v) => set("status", v ? "published" : "draft")} testID="editor-published" hint="Off = saved as a private draft." />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SmallBtn tone="dark" label={busy ? "Saving…" : "Save"} testID="editor-save" onPress={save} />
          <SmallBtn label="Cancel" testID="editor-cancel" onPress={() => setEdit(null)} />
        </View>
      </Card>
    );
  }

  return (
    <View style={{ gap: S.lg }} testID="admin-gallery">
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <SmallBtn tone="dark" label="Add screenshot" testID="gallery-add-image" onPress={() => setEdit({ ...EMPTY, kind: "image" })} icon={<Feather name="plus" size={14} color={colors.onBrandSecondary} />} />
        <SmallBtn label="Add video" testID="gallery-add-video" onPress={() => setEdit({ ...EMPTY, kind: "video", category: "testimonial" })} />
        <SmallBtn label="Add written quote" testID="gallery-add-quote" onPress={() => setEdit({ ...EMPTY, kind: "quote", category: "testimonial" })} />
      </View>
      {isLoading ? <ActivityIndicator color={colors.brand} /> : (data ?? []).map((t, i) => (
        <View key={t.id} testID={`gallery-row-${t.id}`} style={{ flexDirection: "row", gap: 12, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
          <View style={{ width: 64, height: 96, backgroundColor: colors.surfaceInverse, alignItems: "center", justifyContent: "center" }}>
            {t.kind === "image" ? <Image source={{ uri: resolveUrl(t.thumb_url || t.media_url) }} style={{ width: 64, height: 96 }} contentFit="cover" /> : <Feather name={t.kind === "video" ? "video" : "message-circle"} size={20} color={colors.brand} />}
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <Text style={{ fontFamily: F.sansSemi, fontSize: 10, letterSpacing: 1.5, color: t.status === "published" ? colors.success : colors.warning }}>{t.status.toUpperCase()}</Text>
              <Text style={{ fontFamily: F.sansSemi, fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>· {t.category.toUpperCase()}</Text>
              {t.featured ? <Text style={{ fontFamily: F.sansSemi, fontSize: 10, color: colors.goldDeep }}>· FEATURED</Text> : null}
              {t.highlighted ? <Text style={{ fontFamily: F.sansSemi, fontSize: 10, color: colors.goldDeep }}>· HIGHLIGHTED</Text> : null}
            </View>
            <Text numberOfLines={2} style={{ fontFamily: F.sans, fontSize: 13, color: colors.onSurface }}>{t.caption || t.quote || "(no caption)"}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <SmallBtn label="Edit" testID={`gallery-edit-${t.id}`} onPress={() => setEdit(t)} />
              <SmallBtn label={t.status === "published" ? "Unpublish" : "Publish"} testID={`gallery-publish-${t.id}`} onPress={() => quick(t, { status: t.status === "published" ? "draft" : "published" })} />
              <SmallBtn label={t.featured ? "Unfeature" : "Feature"} testID={`gallery-feature-${t.id}`} onPress={() => quick(t, { featured: !t.featured })} />
              <SmallBtn tone="danger" label={confirm === t.id ? "Tap to confirm" : "Delete"} testID={`gallery-delete-${t.id}`} onPress={() => remove(t.id)} />
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Pressable testID={`gallery-up-${t.id}`} onPress={() => move(i, -1)} style={{ width: 40, height: 40, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Move up"><Feather name="arrow-up" size={16} color={colors.onSurface} /></Pressable>
            <Pressable testID={`gallery-down-${t.id}`} onPress={() => move(i, 1)} style={{ width: 40, height: 40, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Move down"><Feather name="arrow-down" size={16} color={colors.onSurface} /></Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}
