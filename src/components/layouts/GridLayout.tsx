import { shuffleArray } from "@/lib/utils";
import { ChaosWrapper } from "@/components/ChaosWrapper";
import { LayoutProps } from "@/types/layout";

export function GridLayout({ components }: LayoutProps) {
    const shuffled = shuffleArray(components);

    return (
        <main className="min-h-screen p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto overflow-hidden">
            <div className="md:col-span-full bg-zinc-900 text-white rounded-3xl p-12 flex items-center justify-center">
                <ChaosWrapper>{shuffled[0]}</ChaosWrapper>
            </div>
            <div className="md:col-span-1 bg-zinc-100 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
                <ChaosWrapper>{shuffled[1]}</ChaosWrapper>
            </div>
            <div className="md:col-span-2 border-2 border-dashed border-zinc-200 rounded-3xl p-8 flex items-center justify-center">
                <ChaosWrapper>{shuffled[2]}</ChaosWrapper>
            </div>
            <div className="md:col-span-full flex justify-center py-8">
                <ChaosWrapper>{shuffled[3]}</ChaosWrapper>
            </div>
        </main>
    );
}
