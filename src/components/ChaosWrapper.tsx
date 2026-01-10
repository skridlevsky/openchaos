import { getChaosStyle } from "@/lib/utils";

export function ChaosWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div style={getChaosStyle()} className="transition-transform duration-300">
            {children}
        </div>
    );
}
