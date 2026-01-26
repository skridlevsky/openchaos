import { Cat } from "@/components/Cat";
import "../retro.css";

export default function GeoCitiesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Cat />
    </>
  );
}
