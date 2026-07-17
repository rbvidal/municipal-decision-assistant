import React from "react";
import type { SkeletonProps } from "../../types";
import { cn } from "../../utils";
import styles from "./Skeleton.module.css";

export const Skeleton: React.FC<SkeletonProps> = React.memo(
  ({ variant = "text", width, height, count = 1, className }) => {
    const elements = Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={cn(styles.skeleton, styles[variant], className)}
        style={{ width, height }}
        aria-hidden="true"
      />
    ));

    if (count === 1) return elements[0];

    return (
      <div className={styles.container} role="status" aria-label="Lädt...">
        {elements}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";
