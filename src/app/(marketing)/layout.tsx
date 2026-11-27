import type { ReactNode } from "react";
import "./landing.css";

/**
 * Marketing group layout.
 *
 * landing.css defines the marketing design system (eyebrow, hero, button,
 * audience/bento/faq sections — 200+ classes used across the marketing
 * pages), but nothing imported it, so those pages rendered unstyled.
 * Importing it here scopes the stylesheet to the (marketing) route group
 * only; the app shell keeps using globals.css alone.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
