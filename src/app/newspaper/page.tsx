import { Suspense } from "react";
import { Countdown } from "@/components/newspaper/Countdown";
import { PRList } from "@/components/newspaper/PRList";
import { NewspaperLayout } from "@/components/newspaper/NewspaperLayout";

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
    </NewspaperLayout>
  );
}
