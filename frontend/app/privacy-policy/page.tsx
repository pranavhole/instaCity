import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { brandName } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy | ${brandName}`,
  description: `Privacy policy for ${brandName}, including how public profile data is used to generate a 3D city.`
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      `When you use ${brandName}, we collect the public profile information needed to create and maintain your session, including username, account identifier, profile image, public post metadata, and generated city/building data.`,
      "We also collect app usage information such as selected profile state, import actions, cached post records, and generated city/building data so the product can show your dashboard and 3D city experience."
    ]
  },
  {
    title: "Public Profile Data",
    body: [
      `${brandName} uses Apify to import public profile post data for the profile URL or username you submit. This may include post image URLs, captions, like counts, comment counts, video view counts, timestamps, and profile display information.`,
      `${brandName} does not ask for Instagram login credentials, does not post to Instagram, does not send messages, and does not change account settings.`
    ]
  },
  {
    title: "How We Use Information",
    body: [
      "We use the information we collect to create local sessions, cache profile data, generate visual buildings, personalize the dashboard, operate the 3D city, improve reliability, and protect the service from abuse.",
      "We may use aggregated, non-identifying usage patterns to understand which parts of the app need improvement."
    ]
  },
  {
    title: "Sharing and Disclosure",
    body: [
      "We do not sell personal information. We share information only when required to operate the service, comply with law, protect users, or respond to valid legal requests.",
      "Service infrastructure providers may process data for hosting, database, caching, and deployment operations under their standard security controls."
    ]
  },
  {
    title: "Data Retention and Deletion",
    body: [
      `We keep cached public profile data while it is needed to provide the service. You can request deletion of cached profile data and generated city records at any time.`,
      "After a verified deletion request, we will remove account records, cached post data, synced metrics, and generated city records unless retention is required for security or legal reasons."
    ]
  },
  {
    title: "Security",
    body: [
      "The Apify API token is stored only on the backend. We use reasonable technical and organizational safeguards to protect data, but no internet service can guarantee absolute security.",
      "If we discover a security issue that materially affects user data, we will take steps to investigate, remediate, and notify affected users when appropriate."
    ]
  },
  {
    title: "Contact",
    body: [
      "For privacy questions, account deletion, or cached data deletion requests, contact pranavhole050610@gmail.com."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-asphalt text-slate-100">
      <section className="border-b border-white/10 bg-brand-panel/70 bg-brand-radial">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
          <Link href="/" aria-label={`${brandName} home`}>
            <BrandLogo compact />
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            This policy explains how {brandName} collects, uses, stores, and protects information when you import a
            public profile and use the 3D city experience.
          </p>
          <p className="mt-4 text-sm text-slate-400">Last updated: June 28, 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-400">
          <span>{brandName} privacy and data use policy</span>
          <Link href="/" className="font-semibold text-signal hover:text-white">
            Back to app
          </Link>
        </div>
      </section>
    </main>
  );
}
