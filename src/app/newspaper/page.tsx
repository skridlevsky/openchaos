import { Suspense } from "react";
import { Countdown } from "@/components/newspaper/Countdown";
import { PRList } from "@/components/newspaper/PRList";
import { NewspaperLayout } from "@/components/newspaper/NewspaperLayout";
import { HallOfChaos } from "@/components/newspaper/HallOfChaos";
import { AuthButton } from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AwardBoard } from "@/components/newspaper/AwardBoard";
import { CollapsibleSection } from "@/components/newspaper/CollapsibleSection";

export default function NewspaperHome() {
  return (
    <NewspaperLayout>
      <div className="np-top-controls">
        <AuthButton />
        <ThemeToggle />
      </div>
      <Countdown />

      <Suspense fallback={<div className="np-loading">The reporters are filing their stories...</div>}>
        <PRList />
      </Suspense>

      <CollapsibleSection title="THE ARCHIVES" subtitle="Previously Published Editions" defaultExpanded={false}>
        <Suspense fallback={<div className="np-loading">Searching the morgue files...</div>}>
          <HallOfChaos />
        </Suspense>
      </CollapsibleSection>

      <AwardBoard />
    </NewspaperLayout>
  );
}
