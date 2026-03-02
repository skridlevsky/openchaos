import { ThemePathProvider } from "@/context/ThemePathContext";
import "./newspaper.css";

export default function NewspaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemePathProvider themePath="newspaper">
      {children}
    </ThemePathProvider>
  );
}
