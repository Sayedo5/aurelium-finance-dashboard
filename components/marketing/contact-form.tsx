"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useAppContext } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

const topics = [
  "Product question",
  "Pricing and plans",
  "Migrating from another tool",
  "Partnership or integration",
  "Something else"
];

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

/**
 * A working contact form with real validation and a submitted state.
 *
 * There is no backend, so nothing is transmitted — the form says so plainly on
 * success rather than implying a message was delivered.
 */
export function ContactForm() {
  const { addToast } = useAppContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Tell us who you are.";
    // Deliberately permissive: enough to catch a typo, not enough to reject a valid address.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "That address does not look valid.";
    if (message.trim().length < 12) next.message = "A little more detail helps us reply usefully.";
    return next;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      addToast({
        title: "Check the form",
        body: "A few fields still need attention.",
        tone: "warning"
      });
      return;
    }

    setSubmitting(true);
    // Stands in for the latency of a real submission.
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      addToast({
        title: "Message captured",
        body: "This demo has no mail server, so nothing was actually sent.",
        tone: "info"
      });
    }, 700);
  }

  if (sent) {
    return (
      <Card className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gain-100 text-gain-700 dark:bg-gain-900/40 dark:text-gain-300">
          <CheckCircle2 size={22} aria-hidden />
        </span>
        <h3 className="mt-5 text-base font-semibold text-ink">Thanks, {name.split(" ")[0]}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-inkMuted">
          Your message about <span className="font-medium text-ink">{topic.toLowerCase()}</span> has
          been captured locally. This is a portfolio demonstration with no mail server, so nothing
          left your browser and no reply is coming.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setSent(false);
            setName("");
            setEmail("");
            setOrganisation("");
            setMessage("");
            setTopic(topics[0]);
            setErrors({});
          }}
        >
          Send another
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="contact-name">
            <Input
              id="contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setErrors(validate())}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              placeholder="Sayed Muhammad"
              className={cn(errors.name && "border-loss-500 focus:border-loss-500")}
            />
            {errors.name ? (
              <p id="contact-name-error" className="mt-1.5 text-xs text-loss-600 dark:text-loss-400">
                {errors.name}
              </p>
            ) : null}
          </Field>

          <Field label="Work email" htmlFor="contact-email">
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setErrors(validate())}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              placeholder="you@company.com"
              className={cn(errors.email && "border-loss-500 focus:border-loss-500")}
            />
            {errors.email ? (
              <p id="contact-email-error" className="mt-1.5 text-xs text-loss-600 dark:text-loss-400">
                {errors.email}
              </p>
            ) : null}
          </Field>

          <Field label="Organisation" htmlFor="contact-org" hint="Optional">
            <Input
              id="contact-org"
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
              placeholder="Company name"
            />
          </Field>

          <Field label="Topic" htmlFor="contact-topic">
            <Select
              id="contact-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-inkMuted">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onBlur={() => setErrors(validate())}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            placeholder="What would you like to know?"
            className={cn(
              "w-full resize-y rounded-control border border-line bg-surface px-3.5 py-3 text-sm text-ink outline-none transition duration-150 ease-smooth placeholder:text-inkSubtle hover:border-lineStrong focus:border-aurum-400 focus:ring-2 focus:ring-aurum-400/25",
              errors.message && "border-loss-500 focus:border-loss-500"
            )}
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {errors.message ? (
              <p id="contact-message-error" className="text-xs text-loss-600 dark:text-loss-400">
                {errors.message}
              </p>
            ) : (
              <span />
            )}
            <p className="numeric shrink-0 text-xs text-inkSubtle">{message.length} characters</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="accent" icon={Send} loading={submitting}>
            Send message
          </Button>
          <p className="text-xs text-inkSubtle">
            Nothing is transmitted — this demo has no server.
          </p>
        </div>
      </form>
    </Card>
  );
}
