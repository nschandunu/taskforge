"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
}

export function CountUp({ to, from = 0, duration = 0.8, className }: CountUpProps) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        setValue(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [from, to, duration]);

  return <span className={className}>{value}</span>;
}
