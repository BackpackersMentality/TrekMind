// Privacy.tsx — TrekMind & Backpacker's Mentality Privacy Policy
// Route: /privacy
// Covers: GDPR, CCPA, PIPEDA | BC Canada jurisdiction
// Last updated: April 2026

import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Shield } from "lucide-react";

// ── Table of contents sections ────────────────────────────────────────────────
const SECTIONS = [
  { id: "overview",        label: "1. Overview" },
  { id: "who-we-are",     label: "2. Who We Are" },
  { id: "what-we-collect", label: "3. What We Collect" },
  { id: "how-we-use",     label: "4. How We Use It" },
  { id: "cookies",        label: "5. Cookies & Tracking" },
  { id: "sharing",        label: "6. Data Sharing" },
  { id: "storage",        label: "7. Storage & Security" },
  { id: "retention",      label: "8. Data Retention" },
  { id: "your-rights",    label: "9. Your Rights" },
  { id: "children",       label: "10. Children" },
  { id: "changes",        label: "11. Policy Changes" },
  { id: "contact",        label: "12. Contact Us" },
];

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — TrekMind & Backpacker's Mentality</title>
        <meta name="description" content="Privacy Policy for TrekMind and Backpacker's Mentality. Learn how we collect, use and protect your data under GDPR, CCPA and PIPEDA." />
        <link rel="canonical" href="https://www.trekmind.app/privacy" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">

        {/* ── Header ── */}
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">Privacy Policy</span>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">Last updated: 9 April 2026</span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-10 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">

          {/* ── Sticky TOC (desktop) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Contents</p>
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1 hover:pl-1"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </aside>

          {/* ── Policy body ── */}
          <article className="prose prose-sm max-w-none space-y-10">

            {/* Hero */}
            <div className="not-prose bg-muted/40 rounded-2xl p-6 border border-border/50">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Privacy Policy
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This Privacy Policy covers both <strong className="text-foreground">TrekMind</strong> (trekmind.app) and <strong className="text-foreground">Backpacker's Mentality</strong> (backpackersmentality.com), two properties operated by the same individual based in British Columbia, Canada. We are committed to being transparent about what data we collect and why.
              </p>
            </div>

            {/* 1. Overview */}
            <section id="overview">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">01</span>
                Overview
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We believe your personal data belongs to you. We collect only what is necessary to provide our services, we never sell your personal information to third parties, and we give you meaningful controls over your data. This policy explains exactly what we collect, how we use it, and your rights — written in plain English, not legal jargon.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "No ads", desc: "Neither platform displays third-party advertising." },
                  { label: "No data sales", desc: "We never sell your personal information." },
                  { label: "You're in control", desc: "Delete your account and data at any time." },
                ].map(item => (
                  <div key={item.label} className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <p className="text-xs font-bold text-primary mb-1">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Who We Are */}
            <section id="who-we-are">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">02</span>
                Who We Are
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                TrekMind and Backpacker's Mentality are operated as a sole proprietorship based in <strong className="text-foreground">British Columbia, Canada</strong>. As such, we are subject to the <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) at the federal level and the <em>Personal Information Protection Act</em> (PIPA BC) at the provincial level. We also comply with the EU/UK General Data Protection Regulation (GDPR) for users in the European Economic Area and the UK, and the California Consumer Privacy Act (CCPA/CPRA) for California residents.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Data Controller:</strong> Backpacker's Mentality / TrekMind<br />
                <strong className="text-foreground">Jurisdiction:</strong> British Columbia, Canada<br />
                <strong className="text-foreground">Contact:</strong>{" "}
                <a href="mailto:hello@backpackersmentality.com" className="text-primary underline-offset-2 underline">
                  hello@backpackersmentality.com
                </a>
              </p>
            </section>

            {/* 3. What We Collect */}
            <section id="what-we-collect">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">03</span>
                What Information We Collect
              </h2>

              <h3 className="text-sm font-bold text-foreground mb-2 mt-5">3.1 TrekMind App — Account Data (Supabase)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                If you create a TrekMind account to save treks, we collect and store:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-none pl-0">
                {[
                  { item: "Email address", why: "Required to create and identify your account." },
                  { item: "Name (if provided via Google Sign-In)", why: "Passed automatically by Google's OAuth; not required independently." },
                  { item: "Saved trek lists", why: "Your completed, in-progress, and wishlist treks — the core function of the account." },
                  { item: "First-visit preference", why: "A flag recording whether you've seen the introduction overlay, so we don't show it again." },
                  { item: "Authentication tokens", why: "Session tokens issued by Supabase to keep you securely logged in." },
                ].map(d => (
                  <li key={d.item} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span><strong className="text-foreground">{d.item}:</strong> {d.why}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                <strong className="text-foreground">Anonymous users:</strong> If you use TrekMind without an account, we store your trek list and intro-seen preference in your browser's <code className="text-xs bg-muted px-1 rounded">localStorage</code> only. This data never leaves your device and is not associated with any identity.
              </p>

              <h3 className="text-sm font-bold text-foreground mb-2 mt-5">3.2 Usage & Analytics Data (Google Analytics)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                We use Google Analytics 4 on both TrekMind and Backpacker's Mentality to understand how our platforms are used. This collects:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-none pl-0">
                {[
                  "Pages visited and time spent on each page",
                  "Approximate geographic location (country/region level — not precise GPS)",
                  "Device type, browser, and operating system",
                  "Referring website (how you arrived at our platform)",
                  "Interactions such as clicks and navigation patterns",
                ].map(d => (
                  <li key={d} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0 mt-1.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                Google Analytics data is anonymised and aggregated. We do not use it to identify individual users. This data is only collected with your explicit consent via the cookie banner.
              </p>

              <h3 className="text-sm font-bold text-foreground mb-2 mt-5">3.3 Backpacker's Mentality Blog — Affiliate Links</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Backpacker's Mentality uses affiliate marketing links (for example, links to gear on retailer websites). When you click an affiliate link, the retailer's website may set its own cookies to track the referral. <strong className="text-foreground">Affiliate link tracking cookies are strictly limited to the Backpacker's Mentality blog and are never present inside the TrekMind app.</strong> We disclose affiliate relationships clearly at the top of relevant articles.
              </p>

              <h3 className="text-sm font-bold text-foreground mb-2 mt-5">3.4 Information We Do NOT Collect</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-none pl-0">
                {[
                  "We do not collect precise GPS location data",
                  "We do not collect payment card information (we have no paid features)",
                  "We do not serve display advertising — no ad networks operate on our platforms",
                  "We do not build advertising profiles or sell data to data brokers",
                ].map(d => (
                  <li key={d} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. How We Use It */}
            <section id="how-we-use">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">04</span>
                How We Use Your Information
              </h2>
              <div className="space-y-3">
                {[
                  { purpose: "Providing the service", detail: "Your account data (email, saved treks) is used solely to deliver TrekMind's core functionality — saving and syncing your trek lists across devices.", legal: "Contract (GDPR Art. 6(1)(b))" },
                  { purpose: "Authentication & security", detail: "Session tokens and authentication data keep your account secure and prevent unauthorised access.", legal: "Legitimate Interest (GDPR Art. 6(1)(f))" },
                  { purpose: "Platform improvement", detail: "Aggregated, anonymised analytics data helps us understand which features are most useful and where users encounter problems.", legal: "Consent (GDPR Art. 6(1)(a))" },
                  { purpose: "Affiliate revenue", detail: "Affiliate links on the blog generate commission when you click through and make a purchase. We have no access to your purchase data on those third-party sites.", legal: "Legitimate Interest (GDPR Art. 6(1)(f))" },
                  { purpose: "Legal compliance", detail: "We may process your data to comply with applicable laws or respond to lawful government requests.", legal: "Legal Obligation (GDPR Art. 6(1)(c))" },
                ].map(item => (
                  <div key={item.purpose} className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm font-semibold text-foreground">{item.purpose}</p>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">{item.legal}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Cookies */}
            <section id="cookies">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">05</span>
                Cookies &amp; Tracking Technologies
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                We use three categories of cookies. Strictly necessary cookies are set automatically. All other categories require your explicit consent through our cookie banner.
              </p>
              <div className="space-y-3">
                {[
                  {
                    name: "Strictly Necessary",
                    badge: "Always Active",
                    badgeColor: "bg-emerald-100 text-emerald-700",
                    platform: "TrekMind App",
                    detail: "Supabase authentication and session cookies. Required to keep you logged in and to secure your account. Cannot be disabled without breaking core functionality.",
                    examples: ["supabase-auth-token", "sb-access-token", "sb-refresh-token"],
                  },
                  {
                    name: "Analytics",
                    badge: "Consent Required",
                    badgeColor: "bg-amber-100 text-amber-700",
                    platform: "TrekMind App + Blog",
                    detail: "Google Analytics 4 cookies that collect anonymised usage data. Help us understand how the platform is used. Only set after you accept analytics cookies.",
                    examples: ["_ga", "_ga_XXXXXXXX", "_gid"],
                  },
                  {
                    name: "Marketing / Affiliate",
                    badge: "Consent Required",
                    badgeColor: "bg-rose-100 text-rose-700",
                    platform: "Blog only — never in TrekMind App",
                    detail: "Third-party cookies set by affiliate partner retailers (e.g. Amazon Associates, REI) when you click an affiliate link on the blog. We do not control these cookies — they are governed by the retailer's own privacy policy.",
                    examples: ["affiliate tracking tokens (set by retailers)"],
                  },
                ].map(cat => (
                  <div key={cat.name} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                      <div>
                        <span className="text-sm font-bold text-foreground">{cat.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {cat.platform}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>{cat.badge}</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{cat.detail}</p>
                      <p className="text-[10px] text-muted-foreground/70">Examples: {cat.examples.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                You can change your cookie preferences at any time by clicking "Cookie Settings" in the page footer.
              </p>
            </section>

            {/* 6. Data Sharing */}
            <section id="sharing">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">06</span>
                How We Share Your Data
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">We do not sell your personal information.</strong> We share data only in the following limited circumstances:
              </p>
              <div className="space-y-3">
                {[
                  { party: "Supabase Inc.", role: "Database & Authentication Provider", detail: "Stores your account data (email, saved treks) on our behalf. Supabase is SOC 2 Type II certified. Data is stored on AWS infrastructure in the US/EU. Supabase acts as a Data Processor under GDPR.", link: "https://supabase.com/privacy" },
                  { party: "Google LLC", role: "Analytics Provider", detail: "Google Analytics processes anonymised usage data. Google may process data in the United States. Only active with your consent. Google is certified under the EU-US Data Privacy Framework.", link: "https://policies.google.com/privacy" },
                  { party: "Affiliate Retailers", role: "Third-party merchants (Blog only)", detail: "When you click an affiliate link, you leave our platform. The merchant's own privacy policy governs any data they collect. We receive only a commission notification — not your personal data.", link: null },
                  { party: "Legal authorities", role: "Where required by law", detail: "We may disclose data to law enforcement or regulatory bodies if required by a valid legal order. We will notify you where legally permitted to do so.", link: null },
                ].map(item => (
                  <div key={item.party} className="bg-muted/20 rounded-xl p-4 border border-border/50">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">{item.party}</p>
                      <span className="text-[10px] text-muted-foreground">{item.role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary underline underline-offset-2 mt-1 inline-block">
                        View their privacy policy →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Storage & Security */}
            <section id="storage">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">07</span>
                Data Storage &amp; Security
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Account data is stored on Supabase's infrastructure (AWS), which may be located in the United States or European Union depending on your region. Supabase encrypts data at rest (AES-256) and in transit (TLS 1.2+).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                The TrekMind application itself is served via Cloudflare Pages' global CDN, which provides HTTPS encryption for all traffic and DDoS protection.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Anonymous users' trek data is stored only in their own browser's <code className="text-xs bg-muted px-1 rounded">localStorage</code> — it is not transmitted to our servers. We recommend creating an account if you want your data backed up and accessible across devices.
              </p>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Important:</strong> No method of electronic transmission or storage is 100% secure. While we implement industry-standard safeguards, we cannot guarantee absolute security. If you believe your account has been compromised, contact us immediately at hello@backpackersmentality.com.
                </p>
              </div>
            </section>

            {/* 8. Retention */}
            <section id="retention">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">08</span>
                Data Retention
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                We retain your account data for as long as your account exists. If you request deletion, we will permanently delete your account and all associated data within <strong className="text-foreground">30 days</strong>, except where retention is required by law (e.g. financial records we may be obligated to keep for tax purposes).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Analytics data retained in Google Analytics is governed by our retention settings (set to 14 months). Anonymous browser localStorage data is retained until you clear your browser data or use a different device.
              </p>
            </section>

            {/* 9. Your Rights */}
            <section id="your-rights">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">09</span>
                Your Privacy Rights
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Depending on where you live, you have specific legal rights regarding your personal data. We honour all of the following regardless of your jurisdiction.
              </p>
              <div className="space-y-2">
                {[
                  { right: "Right to Access", detail: "Request a copy of all personal data we hold about you.", applies: "GDPR · CCPA · PIPEDA" },
                  { right: "Right to Correction", detail: "Ask us to correct inaccurate or incomplete personal data.", applies: "GDPR · CCPA · PIPEDA" },
                  { right: "Right to Deletion (Right to be Forgotten)", detail: "Request permanent deletion of your account and all associated personal data.", applies: "GDPR · CCPA · PIPEDA" },
                  { right: "Right to Data Portability", detail: "Receive your data in a machine-readable format (e.g. JSON export of your trek lists).", applies: "GDPR · CCPA" },
                  { right: "Right to Restrict Processing", detail: "Ask us to stop processing your data in certain ways while still keeping your account active.", applies: "GDPR" },
                  { right: "Right to Object", detail: "Object to processing based on legitimate interests (e.g. analytics). You can withdraw analytics consent via the cookie banner at any time.", applies: "GDPR" },
                  { right: "Right to Opt Out of Sale/Sharing", detail: "We do not sell or share personal information for cross-context advertising. This right is technically satisfied by our business model, but you may formally assert it in writing.", applies: "CCPA/CPRA" },
                  { right: "Right to Non-Discrimination", detail: "We will never deny you service, charge different prices, or provide a different level of quality because you exercised any of these rights.", applies: "CCPA/CPRA" },
                ].map(item => (
                  <div key={item.right} className="flex gap-3 items-start py-3 border-b border-border/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.right}</p>
                        <span className="text-[9px] text-muted-foreground shrink-0 text-right">{item.applies}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground font-semibold mb-1">To exercise any of these rights:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Email us at <a href="mailto:hello@backpackersmentality.com" className="text-primary underline underline-offset-2">hello@backpackersmentality.com</a> with the subject line "Privacy Request". We will respond within <strong className="text-foreground">30 days</strong> (GDPR requires 30 days; PIPEDA requires 30 days; CCPA requires 45 days — we aim for 30 across the board). We may need to verify your identity before processing the request.
                </p>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2 mt-5">Right to Complain</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you are in the EU/UK and are not satisfied with our response, you have the right to lodge a complaint with your local Data Protection Authority. In Canada, you may contact the <a href="https://www.priv.gc.ca/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Office of the Privacy Commissioner of Canada</a>.
              </p>
            </section>

            {/* 10. Children */}
            <section id="children">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">10</span>
                Children's Privacy
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                TrekMind and Backpacker's Mentality are not directed at children under the age of 16 (or 13 in jurisdictions where that age threshold applies). We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it immediately.
              </p>
            </section>

            {/* 11. Changes */}
            <section id="changes">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">11</span>
                Changes to This Policy
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update this policy when our practices change or when laws require it. The "Last updated" date at the top of this page will always reflect when the most recent changes were made. For material changes, we will notify logged-in users by email or via a prominent notice on the platform.
              </p>
            </section>

            {/* 12. Contact */}
            <section id="contact">
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-muted-foreground/50 text-sm font-normal">12</span>
                Contact Us
              </h2>
              <div className="bg-muted/40 rounded-2xl p-6 border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  For any privacy-related questions, data requests, or concerns, please contact us directly. We are a small team and we read every message.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong className="text-foreground">Email:</strong>{" "}
                    <a href="mailto:hello@backpackersmentality.com" className="text-primary underline underline-offset-2">
                      hello@backpackersmentality.com
                    </a>
                  </p>
                  <p><strong className="text-foreground">Operating as:</strong> Backpacker's Mentality / TrekMind</p>
                  <p><strong className="text-foreground">Jurisdiction:</strong> British Columbia, Canada</p>
                  <p><strong className="text-foreground">Response time:</strong> Within 30 days of receiving your request</p>
                </div>
              </div>
            </section>

          </article>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-4 mt-8">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">© 2026 TrekMind / Backpacker's Mentality. British Columbia, Canada.</p>
            <div className="flex gap-4 text-[10px] text-muted-foreground">
              <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
              <Link href="/terms" className="underline underline-offset-2">Terms of Use</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
