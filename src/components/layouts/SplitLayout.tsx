import { shuffleArray } from "@/lib/utils";
import { ChaosWrapper } from "@/components/ChaosWrapper";
import { LayoutProps } from "@/types/layout";

export function SplitLayout({ components }: LayoutProps) {
    const shuffled = shuffleArray(components);
    const splitIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
    const left = shuffled.slice(0, splitIndex);
    const right = shuffled.slice(splitIndex);

    const isFlipped = Math.random() > 0.5;

    return (
        <main className="min-h-screen p-8 flex flex-col gap-12 overflow-hidden">
            <div
                className={`flex flex-col md:flex-row gap-12 items-start justify-center max-w-6xl mx-auto w-full ${isFlipped ? "md:flex-row-reverse" : ""
                    }`}
            >
                <div className="flex-1 flex flex-col items-center md:items-start gap-12 w-full">
                    {left.map((comp, i) => (
                        <div key={i} className="w-full flex justify-center md:justify-start">
                            <ChaosWrapper>{comp}</ChaosWrapper>
                        </div>
                    ))}
                </div>
                <div className="flex-1 w-full bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100 flex flex-col gap-12">
                    {right.map((comp, i) => (
                        <div key={i} className="w-full">
                            <ChaosWrapper>{comp}</ChaosWrapper>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
