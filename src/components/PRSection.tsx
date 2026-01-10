import { Suspense } from "react";
import { PRList } from "@/components/PRList";

export function PRSection() {
    return (
        <section className="mt-16 w-full flex flex-col items-center">
            <h2 className="text-xl font-medium text-zinc-600 mb-6">
                Open PRs — Vote to merge
            </h2>
            <Suspense
                fallback={
                    <div className="w-full max-w-xl text-center py-8">
                        <p className="text-zinc-500">Loading PRs...</p>
                    </div>
                }
            >
                <PRList />
            </Suspense>
        </section>
    );
}
