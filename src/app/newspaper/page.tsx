import { Suspense } from "react";
import { Countdown } from "@/components/newspaper/Countdown";
import { PRList } from "@/components/newspaper/PRList";
import { NewspaperLayout } from "@/components/newspaper/NewspaperLayout";
import { HallOfChaos } from "@/components/newspaper/HallOfChaos";
import { AuthButton } from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";

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

      <hr className="np-rule-double" />

      <div className="np-archives-header">THE ARCHIVES</div>
      <div className="np-archives-subheader">Previously Published Editions</div>
      <hr className="np-rule-single" />

      <Suspense fallback={<div className="np-loading">Searching the morgue files...</div>}>
        <HallOfChaos />
      </Suspense>
    </NewspaperLayout>
  );
}
