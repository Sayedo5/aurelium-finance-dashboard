import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, LifeBuoy, Mail, MapPin, MessagesSquare, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/marketing/contact-form";
import { Section, SectionHeading } from "@/components/marketing/sections";
import { company } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Contact | Aurelium Ledger",
  description:
    "Get in touch about Aurelium Ledger — product questions, pricing, migration or partnerships."
};

const channels = [
  {
    icon: Mail,
    label: "Support",
    value: company.supportEmail,
    href: `mailto:${company.supportEmail}`,
    detail: "Product help and account questions"
  },
  {
    icon: MessagesSquare,
    label: "Sales",
    value: company.salesEmail,
    href: `mailto:${company.salesEmail}`,
    detail: "Plans, migration and procurement"
  },
  {
    icon: Phone,
    label: "Phone",
    value: company.phone,
    detail: "Weekdays, 9am–6pm Pacific"
  }
];

const quickLinks = [
  {
    icon: BookOpen,
    title: "Looking for what it does?",
    description: "Every module, listed with what is actually built.",
    href: "/features",
    label: "Features"
  },
  {
    icon: LifeBuoy,
    title: "Wondering about cost?",
    description: "Three tiers, compared line by line.",
    href: "/pricing",
    label: "Pricing"
  },
  {
    icon: Clock,
    title: "Just want to look around?",
    description: "The dashboard opens with no sign-up.",
    href: "/dashboard",
    label: "Open dashboard"
  }
];

export default function ContactPage() {
  return (
    <>
      <Section className="pb-8 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to us"
          description="Questions about the product, the build, or how something on screen was put together — all welcome."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
          <ContactForm />

          <div className="space-y-4">
            <Card>
              <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
                Direct channels
              </h3>
              <ul className="mt-5 space-y-4">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const content = (
                    <>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surfaceMuted text-aurum-700 dark:text-aurum-400">
                        <Icon size={16} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium uppercase tracking-wider text-inkSubtle">
                          {channel.label}
                        </span>
                        <span className="block truncate text-sm font-medium text-ink">
                          {channel.value}
                        </span>
                        <span className="block text-xs text-inkMuted">{channel.detail}</span>
                      </span>
                    </>
                  );

                  return (
                    <li key={channel.label}>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          className="flex items-start gap-3 rounded-control p-1 transition hover:bg-surfaceMuted"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-start gap-3 p-1">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex items-start gap-2.5 border-t border-line pt-5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-inkSubtle" aria-hidden />
                <p className="text-xs leading-relaxed text-inkMuted">{company.address}</p>
              </div>
            </Card>

            <Card>
              <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
                Might be quicker
              </h3>
              <ul className="mt-4 space-y-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-start gap-3 rounded-control border border-line p-3 transition duration-150 hover:border-aurum-400/40 hover:bg-surfaceMuted"
                      >
                        <Icon
                          size={16}
                          aria-hidden
                          className="mt-0.5 shrink-0 text-aurum-700 dark:text-aurum-400"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink">{link.title}</span>
                          <span className="block text-xs text-inkMuted">{link.description}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
