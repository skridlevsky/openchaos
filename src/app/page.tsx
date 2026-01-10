import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownSection } from "@/components/CountdownSection";
import { PRSection } from "@/components/PRSection";
import { VerticalLayout } from "@/components/layouts/VerticalLayout";
import { SplitLayout } from "@/components/layouts/SplitLayout";
import { GridLayout } from "@/components/layouts/GridLayout";

export default function Home() {
  const componentList = [
    <Header key="header" />,
    <CountdownSection key="countdown" />,
    <PRSection key="prs" />,
    <Footer key="footer" />,
  ];

  const layouts = [
    { name: "Vertical", Component: VerticalLayout },
    { name: "Split", Component: SplitLayout },
    { name: "Grid", Component: GridLayout },
  ];

  const RandomLayout =
    layouts[Math.floor(Math.random() * layouts.length)].Component;

  return <RandomLayout components={componentList} />;
}
