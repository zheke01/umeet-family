import { createFileRoute } from "@tanstack/react-router";

import {
  CareSection,
  FinalCta,
  GardenSection,
  Hero,
  ParentsSection,
  SiteFooter,
  SiteNav,
  WidgetSection,
} from "../components/umeet/landing";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-mist">
      <SiteNav />
      <main>
        <Hero />
        <WidgetSection />
        <GardenSection />
        <CareSection />
        <ParentsSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
