"use client";

import { MouseEventHandler } from "react";
import * as motion from "framer-motion/client";
import { Button } from "./ui/button";

export default function DrumpIcon({
  icon,
  onClick,
  style,
  className,
}: {
  icon?: any;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scaleY: 1 }}
      whileHover={{ scaleY: [1.3, 1, 1.2, 1, 1.1, 1] }}
      transition={{ duration: 0.4 }}
    >
      <Button onClick={onClick} size="icon" style={style} className={className}>
        {icon}
      </Button>
    </motion.div>
  );
}
