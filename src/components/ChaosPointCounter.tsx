"use client";
import "../app/chaos_points.css";

export function ChaosPointCounter({ pts }: { pts: number }) {

  return (
    <div className="chaos-point-counter">
      <img src="chaos_points.gif"/>
      <p>{pts} pts</p>
    </div>
  );
}
