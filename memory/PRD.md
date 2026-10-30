# Gold House Trading — PRD

## Original problem statement
Premium, mobile-first official website for Gold House Trading (Esothrive LLC DBA Gold House Trading), founder and sole coach Alysha Lee. It's an education brand teaching gold (XAUUSD) through a Four-Week Intensive. The site's job is credibility, real student results, the founder's story, and collecting waitlist leads with compliant email/SMS consent. It also needs an admin dashboard and legal pages. Full brief in conversation; follow-ups added a "Before the freedom, there was faith" story, a core values letter carousel, required phone, first-person warm copy, Continued Education (paid Discord with daily breakdowns, paid 1-on-1 calls), the small-cohort section (6–12 hand-picked students each month), acting (4 Amazon Prime movies) in About, and a smaller hero.

## Architecture
- Frontend: Expo Router (web + native). Single scrolling homepage `app/index.tsx` with section components in `src/home/*`, legal pages at `app/legal/[slug].tsx`, and admin at `app/admin/index.tsx` (login) and `app/admin/dashboard.tsx` (tabs: Overview, Leads, Gallery, Content, Media; components in `src/admin/*`).
- Design tokens are in `src/theme.ts`, with UI primitives in `src/ui.tsx`. Fonts are Cormorant Garamond and Inter (local TTFs).
- Backend: FastAPI `server.py` and `content_defaults.py` (default copy, curriculum, FAQ, legal drafts, seeded testimonials). MongoDB collections: leads, testimonials, settings, media, admins.
- Auth: JWT bearer (12 hours) and bcrypt; the admin is seeded from env.
- Storage: Emergent Object Storage for admin uploads (a web-optimized copy is made and the original kept). Seeded videos are converted to H.264 MP4 and served from `backend/static/seed` with range support.
- Leads:
  - Upserted by email.
  - The consent log records the exact text, version, timestamp, source page, IP and user agent.
  - Phones are saved in E.164 format.
  - SMS status is set only on explicit opt-in.
  - The admin can only opt contacts out.
  - Deletes are soft deletes.
- Spam protection uses a honeypot field and a per-IP rate limit (CF-Connecting-IP).
- An optional webhook URL receives each new or updated lead. No SMS or email is sent by the site.

## Implemented (Oct 30 2026)
- All homepage sections:
  - Hero, Philosophy, Student Results (masonry, filters, lightbox with zoom, disclosure, featured quote hidden until published).
  - Meet Alysha, Story with video slot and Then & Now timeline, Values carousel (6 letters).
  - Why Different, Small Cohort, Intensive (benefits and curriculum accordion), Continued Education.
  - Commitment, Who For, Vision, Waitlist, FAQ, Final CTA, Footer.
- Sticky nav with a hamburger menu, a sticky mobile waitlist CTA, and SEO meta tags.
- Admin:
  - Leads: search, filters, consent records, CSV export (all or SMS opted-in), unsubscribe and opt-out.
  - Gallery: CRUD, upload, reorder, feature or highlight, drafts, and a permission gate before publishing.
  - Content: cohort dates, price, announcement toggles, photos and video, socials, curriculum, FAQ, legal pages with a reviewed flag, webhook, and password change.
  - Media library with folders.
- 15 student screenshots and 4 videos seeded. 2 are drafts because their overlay text predicts outcomes.

## Backlog
- P1: Upload the story video; owner/legal review of the legal pages; business mailing address.
- P1: Connect an SMS provider (Twilio/Textedly) and an email platform through the webhook once registrations are approved.
- P2: Social share image (og:image), custom domain, student portal (future).
- Oct 30 2026: Fixed founder/story section overlap on mobile; swim fact updated (Bob Bowman & Michael Phelps).
- Oct 30 2026: Pricing block ($1,699, $2,000 increase note, payment plan, admin-editable); Referral program section ($100) + "Who referred you?" waitlist field (stored, searchable, CSV); removed mobile sticky CTA (covered text); 320px nav fix; headline line-height increased.
- Oct 30 2026: Added 'What is trading' (beginner explainer) and 'Success Path' (10x graduate account) sections; income figures intentionally omitted for compliance.
