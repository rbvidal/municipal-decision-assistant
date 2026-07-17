import React, { useState, useRef, useCallback } from "react";
import { cn } from "../../../utils";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = React.memo(
  ({ content, children, position = "top", delay = 400, className }) => {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const show = useCallback(() => {
      timerRef.current = setTimeout(() => setVisible(true), delay);
    }, [delay]);

    const hide = useCallback(() => {
      clearTimeout(timerRef.current);
      setVisible(false);
    }, []);

    const child = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      "aria-describedby": visible ? "tooltip-content" : undefined,
    });

    return (
      <span className={styles.wrapper}>
        {child}
        {visible && (
          <span
            id="tooltip-content"
            className={cn(styles.tooltip, styles[position], className)}
            role="tooltip"
          >
            {content}
          </span>
        )}
      </span>
    );
  },
);

Tooltip.displayName = "Tooltip";
