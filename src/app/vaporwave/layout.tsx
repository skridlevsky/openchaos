import { CursorTrail } from "@/components/CursorTrail";
import "./vaporwave.css";

export default function VaporwaveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="vw-container">
      {children}
      <CursorTrail />
    </div>
  );
}
