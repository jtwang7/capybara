"use client";

import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import styles from "./styles.module.css";
import clsx from "clsx";

const EnterButton = forwardRef(
  (
    {
      text,
      onClick,
      style,
      className,
    }: {
      text: string;
      onClick?: MouseEventHandler<HTMLButtonElement>;
      style?: React.CSSProperties;
      className?: string;
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      /* From Uiverse.io by Creatlydev */
      <button
        style={style}
        ref={ref}
        className={clsx(
          styles["button"],
          "bg-gradient-to-r",
          "from-cyan-500",
          "to-blue-500",
          "hover:from-black",
          "hover:to-blac",
          !!className && className
        )}
        onClick={onClick}
      >
        <span className={styles["button__icon-wrapper"]}>
          <svg
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${styles["button__icon-svg"]} text-black`}
            width="10"
          >
            <path
              d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
              fill="currentColor"
            ></path>
          </svg>

          <svg
            viewBox="0 0 14 15"
            fill="none"
            width="10"
            xmlns="http://www.w3.org/2000/svg"
            className={clsx(
              styles["button__icon-svg"],
              styles["button__icon-svg--copy"],
              "text-black"
            )}
          >
            <path
              d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
              fill="currentColor"
            ></path>
          </svg>
        </span>
        {text}
      </button>
    );
  }
);

EnterButton.displayName = "EnterButton";

export default EnterButton;
