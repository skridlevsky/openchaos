import { redirect } from "next/navigation";
import { pickRandomVariant } from "@/lib/chaos-router";

// Proxy handles / -> /ascii or /web2 via rewrite (URL stays as /).
// This redirect is a fallback in case the proxy doesn't intercept.
export const dynamic = 'force-dynamic';

export default function Home() {
  redirect(`/${pickRandomVariant()}`);
}
