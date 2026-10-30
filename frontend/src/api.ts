import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";

export const BASE = process.env.EXPO_PUBLIC_BACKEND_URL as string;
const TOKEN_KEY = "gh_admin_token";

export const resolveUrl = (u?: string) => (!u ? "" : u.startsWith("http") ? u : `${BASE}${u}`);

export async function getToken(): Promise<string | null> {
  return (await storage.secureGet<string | null>(TOKEN_KEY, null)) as string | null;
}
export const setToken = (t: string) => storage.secureSet(TOKEN_KEY, t);
export const clearToken = () => storage.secureRemove(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: any; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth) {
    const t = await getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let r: Response;
  try {
    r = await fetch(`${BASE}/api${path}`, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  } catch {
    throw new ApiError("You appear to be offline. Please check your connection and try again.", 0);
  }
  let data: any = null;
  try {
    data = await r.json();
  } catch {}
  if (!r.ok) {
    const d = data?.detail;
    const msg = typeof d === "string" ? d : Array.isArray(d) ? fieldMsg(d) : "Something went wrong. Please try again.";
    throw new ApiError(msg, r.status);
  }
  return data as T;
}

function fieldMsg(d: any[]) {
  const f = d[0]?.loc?.[d[0].loc.length - 1];
  if (f === "email") return "Please enter a valid email address.";
  if (f === "first_name") return "Please enter your first name.";
  return "Please check the form and try again.";
}

export type Curriculum = { title: string; items: string[] };
export type Faq = { q: string; a: string };
export type LegalDoc = { title: string; body: string; reviewed: boolean };
export type Site = {
  contact_email: string; support_phone: string; business_address: string;
  instagram_brand: string; tiktok_brand: string; instagram_personal: string; tiktok_personal: string;
  cohort_dates: string; show_cohort_dates: boolean; announcement: string; show_announcement: boolean;
  price: string; show_price: boolean; hero_photo: string; founder_photo: string; lifestyle_photo: string;
  story_video: string; story_video_poster: string; featured_quote: string; featured_name: string; featured_published: boolean;
  curriculum: Curriculum[]; faq: Faq[]; legal: Record<string, LegalDoc>; webhook_url?: string;
  consent: { email: string; sms: string; version: string };
};
export type Testimonial = {
  id: string; kind: "image" | "video" | "quote"; category: "trading" | "testimonial" | "progress";
  media_url: string; thumb_url: string; width?: number | null; height?: number | null; caption: string;
  student_name: string; quote: string; description: string; featured: boolean; highlighted: boolean;
  status: "draft" | "published"; permission_confirmed?: boolean; order: number;
};

export const useSite = () => useQuery({ queryKey: ["site"], queryFn: () => api<Site>("/site") });
export const useTestimonials = () => useQuery({ queryKey: ["testimonials"], queryFn: () => api<Testimonial[]>("/testimonials") });

// True when the site owner is signed in on this device: shows admin-only placeholders.
export function useAdminPreview() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    getToken().then((t) => setOn(!!t));
  }, []);
  return on;
}
