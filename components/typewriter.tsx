"use client";

import { useEffect, useRef } from "react";
import Typed, { TypedOptions } from "typed.js";

export default function Typewriter({
  text,
  options,
  style,
  className,
}: {
  text: string[];
  options?: Partial<TypedOptions>;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef(null);

  useEffect(() => {
    const typed = new Typed(ref.current, {
      strings: text,
      typeSpeed: 100,
      showCursor: false,
      ...options,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return <span ref={ref} style={style} className={className}></span>;
}
