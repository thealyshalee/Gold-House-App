"""Default editable website content for Gold House Trading. Admin edits are stored in MongoDB and override these."""

CONSENT_VERSION = "2026-06-v1"

EMAIL_CONSENT_TEXT = (
    "I agree to the Privacy Policy and understand that Gold House Trading may email me about my waitlist "
    "request and upcoming cohort enrollment."
)

SMS_CONSENT_TEXT = (
    "Yes, I'd like to receive recurring automated text messages from Gold House Trading about upcoming cohorts, "
    "enrollment, classes, and educational updates at the mobile number provided. Consent is not required to purchase. "
    "Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for assistance. "
    "See our SMS Terms and Privacy Policy."
)

A = "https://customer-assets-v7afamib.emergentagent.net/job_goldhouse-trading--2izypckw/artifacts/"

CURRICULUM = [
    {"title": "Week 1 — The Foundation", "items": [
        "Introduction to Gold House and trading", "Understanding the opportunity and risks of trading",
        "Trading terminology and essential tools", "How the gold market works", "Setting realistic expectations",
        "Understanding trading psychology", "Creating a trading journal and daily routine"]},
    {"title": "Week 2 — Understanding the Market", "items": [
        "Candlestick fundamentals", "Market structure", "Support and resistance", "Understanding trading sessions",
        "Identifying important highs and lows", "Learning to analyze charts", "Introduction to the Gold House trading framework"]},
    {"title": "Week 3 — Strategy & Execution", "items": [
        "Understanding the London trading range", "Identifying breakout conditions", "Higher-timeframe confirmation",
        "Fibonacci retracement concepts", "Lower-timeframe entry confirmation", "Stop-loss placement and risk management",
        "Practicing entries using historical charts and simulated trading"]},
    {"title": "Week 4 — Developing Independence", "items": [
        "Combining the complete framework", "Developing a personal trading plan", "Journaling and reviewing trades",
        "Managing emotions and avoiding impulsive decisions", "Understanding position sizing and risk",
        "Identifying common trading mistakes", "Building a sustainable practice routine",
        "Preparing to continue learning independently"]},
]

FAQ = [
    {"q": "Do I need trading experience?", "a": "No. The intensive is designed to help complete beginners build a foundation from the ground up."},
    {"q": "What market will I learn to trade?", "a": "The program focuses primarily on gold, commonly referred to as XAUUSD."},
    {"q": "Who teaches the classes?", "a": "All core live classes are personally taught by Gold House founder Alysha Lee."},
    {"q": "How long is the intensive?", "a": "Four weeks, with one live group class each Monday and additional learning activities throughout the week."},
    {"q": "What happens if I miss a class?", "a": "Class recordings are made available so students can review and catch up."},
    {"q": "Will I receive trading signals?", "a": "The primary focus is education and independent analysis, not dependency on signals or someone else's trades."},
    {"q": "Will I become profitable in four weeks?", "a": "Profitability is not guaranteed. The goal is to teach a structured foundation and practical skills that students can continue developing. Results depend on individual practice, discipline, experience, risk management, and market conditions."},
    {"q": "What happens after the four weeks?", "a": "You can keep learning with me through continued education. Students who finish the intensive can join my paid Discord community, where I post my trade breakdowns every trading day, and you can book a 1-on-1 call with me for an additional fee. Both are completely optional."},
    {"q": "How much does the intensive cost?", "a": "Enrollment pricing and available payment options will be shared when a cohort opens."},
    {"q": "When does the next cohort start?", "a": "Upcoming dates will be announced to waitlist members first."},
    {"q": "Do I need a lot of money to begin learning?", "a": "No large trading deposit is required to study the material. Students can begin practicing with a demo account without risking real capital."},
]

REVIEW_NOTE = "Draft prepared for owner and legal review."

LEGAL = {
    "privacy": {"title": "Privacy Policy", "reviewed": False, "body": """Esothrive LLC DBA Gold House Trading ("Gold House Trading," "we," "us") respects your privacy. This policy explains what we collect through this website, how we use it, and the choices you have.

## Information we collect
When you join the waitlist we collect your first name, optional last name, email address, optional mobile phone number, and your self-described trading experience. We also record the date and time of your submission, the page you submitted from, the exact consent language you agreed to, and basic technical information such as your IP address and browser type, so that we can keep an accurate record of your consent.

## How we use your information
We use your information to respond to your waitlist request, send cohort announcements and enrollment information, and, only if you separately opted in, send text messages about cohorts, enrollment, classes, and educational updates. We also use it to keep our records accurate and to protect the website from abuse.

## Text messaging
Mobile numbers and SMS consent are never sold, rented, or shared with third parties or affiliates for their marketing purposes. Text messaging originator opt-in data and consent will not be shared with any third parties, except service providers that help us deliver messages on our behalf.

## Sharing
We do not sell your personal information. We may share it with service providers that help us operate the website, store data, or send email and text messages, and only as needed to provide those services. We may disclose information if required by law.

## Your choices
You can unsubscribe from emails at any time using the link in our emails or by contacting us. You can stop text messages at any time by replying STOP. You may request access to, correction of, or deletion of your information by contacting us at {{contact_email}}.

## Security and retention
We use reasonable safeguards, including access-restricted administration, to protect your information. We keep waitlist and consent records for as long as needed to operate the waitlist and to demonstrate compliance with consent requirements.

## Children
This website is not intended for anyone under 18, and we do not knowingly collect information from minors.

## Contact
Esothrive LLC DBA Gold House Trading
Email: {{contact_email}}
Text: {{support_phone}}
{{business_address}}"""},
    "sms": {"title": "SMS Terms & Conditions", "reviewed": False, "body": """These terms apply to the Gold House Trading text messaging program operated by Esothrive LLC DBA Gold House Trading.

## Program description
By checking the optional SMS consent box on our waitlist form and providing your mobile number, you agree to receive recurring automated text messages from Gold House Trading about upcoming cohorts, enrollment, classes, and educational updates. Consent is not a condition of any purchase.

## Message frequency
Message frequency varies.

## Costs
Message and data rates may apply. Check your mobile plan with your carrier for details.

## How to opt out
You can cancel at any time. Reply STOP to any message to unsubscribe. After you send STOP, we will send one message confirming that you have been unsubscribed, and you will no longer receive text messages from us unless you opt in again.

## Help
Reply HELP for assistance, or contact us at {{contact_email}} or by text at {{support_phone}}.

## Carriers
Carriers are not liable for delayed or undelivered messages.

## Privacy
Your mobile number and SMS consent are handled according to our Privacy Policy. We do not sell or share mobile numbers or SMS opt-in data with third parties for their marketing purposes.

## Program status
Text messaging may not be active yet. Messages will only be sent once our messaging provider, sending number, and any required carrier registrations are approved and configured."""},
    "terms": {"title": "Terms of Use", "reviewed": False, "body": """These Terms of Use govern your use of the Gold House Trading website, operated by Esothrive LLC DBA Gold House Trading. By using this website you agree to these terms.

## Education only
Gold House Trading provides trading education. Nothing on this website, in our classes, or in our materials is individualized investment, financial, legal, or tax advice. Gold House Trading and Alysha Lee are not registered investment advisers, brokers, or financial planners, and do not manage money on behalf of students.

## No guarantees
We do not guarantee income, profits, employment replacement, or financial independence. Student experiences shown on this website are individual and are not typical or guaranteed.

## Brokers and third parties
Any reference to a broker, platform, or third-party tool is informational only and is not a recommendation or a guarantee of its safety, authorization, or reliability. Some brokers may be offshore or subject to different regulatory standards and protections. You are responsible for verifying whether a provider is authorized to serve residents of your country or state.

## Intellectual property
All website content, course materials, and the Gold House Trading name and logo belong to Esothrive LLC DBA Gold House Trading. You may not copy, resell, or redistribute them without written permission.

## Acceptable use
Please do not misuse the website, submit false information, attempt to access restricted areas, or interfere with its operation.

## Limitation of liability
To the fullest extent permitted by law, Gold House Trading is not liable for any losses arising from your use of this website or from trading decisions you make.

## Changes and contact
We may update these terms from time to time. Questions can be sent to {{contact_email}}."""},
    "risk": {"title": "Trading Risk Disclosure", "reviewed": False, "body": """Please read this disclosure carefully before acting on anything you learn from Gold House Trading.

## Substantial risk
Trading leveraged products such as gold (XAUUSD), forex, and contracts for difference (CFDs) involves substantial risk and is not suitable for everyone. Leverage can work against you as well as for you. You can lose some or all of the money you deposit, and losses can happen quickly.

## Education, not advice
Gold House Trading provides education, not individualized investment advice. Examples, chart markups, and market breakdowns are for educational purposes only and are not recommendations to buy or sell.

## Past performance
Past performance does not guarantee or predict future results. Screenshots and student stories reflect individual experiences, may not represent all students, and are not typical or guaranteed outcomes. Individual results depend on practice, discipline, experience, risk management, and market conditions.

## Brokers
Some brokers may be offshore or subject to different regulatory standards and protections. Any broker reference is informational and is not a guarantee of safety, authorization, or reliability. We do not represent that any offshore broker is authorized to serve U.S. residents.

## Only risk what you can afford to lose
Never trade with money you need for living expenses, savings, or debt payments. Consider practicing on a demo account and seeking advice from a licensed professional before trading with real capital.

## No guarantees
Gold House Trading does not guarantee income, profits, employment replacement, or financial independence."""},
}

DEFAULT_SETTINGS = {
    "contact_email": "goldmindstrading@gmail.com",
    "support_phone": "(602) 804-8859",
    "business_address": "",
    "instagram_brand": "goldhousetrading",
    "tiktok_brand": "goldhousetrading",
    "instagram_personal": "thealyshalee",
    "tiktok_personal": "itsalyshalee",
    "cohort_dates": "",
    "show_cohort_dates": False,
    "announcement": "",
    "show_announcement": False,
    "price": "",
    "show_price": False,
    "hero_photo": "",
    "founder_photo": A + "424f265e440d3e60_IMG_2116.jpg",
    "lifestyle_photo": A + "c5026f4e30936477_IMG_2117.jpg",
    "story_video": "",
    "story_video_poster": "",
    "featured_quote": "",
    "featured_name": "",
    "featured_published": False,
    "curriculum": CURRICULUM,
    "faq": FAQ,
    "legal": LEGAL,
    "webhook_url": "",
}


def _img(seed, file, w, h, category, caption, status="published", highlighted=False):
    return {"seed_key": seed, "kind": "image", "category": category, "media_url": A + file, "thumb_url": A + file,
            "width": w, "height": h, "caption": caption, "status": status, "highlighted": highlighted}


def _vid(seed, file):
    n = seed[1:]
    return {"seed_key": seed, "kind": "video", "category": "testimonial", "media_url": f"/api/static/seed/v{n}.mp4", "thumb_url": f"/api/static/seed/v{n}.jpg",
            "width": 9, "height": 16, "caption": "Student video testimonial", "status": "published", "highlighted": False}


SEED_TESTIMONIALS = [
    _img("s13", "8fa1371b71f18da2_IMG_2130.jpg", 1320, 1910, "progress", "From confusing to clear — a student on trusting the process, the strategy, and herself.", highlighted=True),
    _img("s3", "efd920e57b43a6e1_IMG_2120.webp", 1153, 2000, "trading", "A student's first official trade on a live account.", highlighted=True),
    _img("s1", "ad7f7bf8dc4e208e_IMG_2118.webp", 1195, 2000, "trading", "A student's first profits after waiting for every confirmation."),
    _vid("v1", "c3977c81bcd09e92_v12044gd0000dbih9mvog65u5n91ct40.MP4"),
    _img("s14", "a17f019e88c262ff_IMG_2131.webp", 1264, 2000, "testimonial", "On keeping the strategy simple."),
    _img("s5", "da4f2082cfd6e505_IMG_2122.webp", 1166, 2000, "progress", "Week four — a student explaining her confirmations, stop-loss and take-profit decisions."),
    _img("s2", "298933e14fbb5afd_IMG_2119.webp", 1146, 2000, "trading", "Students in the same setup — including an honest note about over-leveraging."),
    _vid("v2", "daa423e66a6fe814_621e6740625e4516bac9d922d77d529d.MOV"),
    _img("s12", "8a3950e1c67f3d4a_IMG_2129.webp", 1218, 2000, "testimonial", "A message from a student about learning with Alysha."),
    _img("s6", "90583382b3fdb1c4_IMG_2123.webp", 1154, 2000, "progress", "First cohort students analyzing and taking setups on their own."),
    _img("s11", "5feeb10a9a8343f5_IMG_2128.webp", 1147, 2000, "trading", "Students sharing their take-profit moments this week."),
    _img("s4", "de0924d9a1801cc2_IMG_2121.webp", 1176, 2000, "testimonial", "A student reflecting on a first trade."),
    _vid("v3", "a73774d02735775a_6f0f3cf85947471aa39829a1d52eaa39.MOV"),
    _img("s15", "d396471db3d67aeb_IMG_2132.webp", 1278, 2000, "progress", "A student taking the same setup Alysha analyzed that morning."),
    _img("s8", "4b10acc91622706d_IMG_2125.webp", 1189, 2000, "testimonial", "A note from a student after a winning morning."),
    _img("s10", "eaabb2d3c05fd266_IMG_2127.webp", 1189, 2000, "trading", "A student sharing a first live-account result."),
    _vid("v4", "d33c481ca200f2ec_6e197899ceed45f4975bbaf10e9c9dda.MOV"),
    # Held as drafts for owner review: the overlay text includes outcome predictions / profitability claims.
    _img("s7", "2a0b6af536843eec_IMG_2124.webp", 1197, 2000, "trading", "A student's week of practice.", status="draft"),
    _img("s9", "6c353af978c9553a_IMG_2126.webp", 1167, 2000, "testimonial", "Feedback after a live Monday class.", status="draft"),
]
