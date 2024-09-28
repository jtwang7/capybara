"use client";

import Lottie from "lottie-web";
import { useEffect, useRef } from "react";

export default function LottieIcon({
  lottieJsonPath,
  width,
  height,
}: {
  lottieJsonPath: string;
  width: number;
  height: number;
}) {
  const ref = useRef(null!);

  useEffect(() => {
    const animation = Lottie.loadAnimation({
      container: ref.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      // static file save in /public folder, so we can use '/' path in code to import it
      // see: https://nextjs.org/docs/app/building-your-application/optimizing/static-assets
      path: lottieJsonPath,
    });
    return () => {
      animation.destroy();
    };
  }, []);

  return <div ref={ref} style={{ width, height }}></div>;
}
