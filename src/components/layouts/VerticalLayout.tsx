import { shuffleArray } from "@/lib/utils";
import { ChaosWrapper } from "@/components/ChaosWrapper";
import { LayoutProps } from "@/types/layout";

export function VerticalLayout({ components }: LayoutProps) {
    const shuffled = shuffleArray(components);

    return (
        <main className="min-h-screen flex flex-col items-center px-4 py-16 gap-12 overflow-hidden">
            {shuffled.map((component, index) => (
                <div key={index} className="w-full flex justify-center">
                    <ChaosWrapper>{component}</ChaosWrapper>
                </div>
            ))}
        </main>
    );
}
