import React, { forwardRef } from "react";
import type { IconButtonProps } from "../../types";
import { cn } from "../../utils";
import { Spinner } from "./Spinner";
import styles from "./IconButton.module.css";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      ariaLabel,
      size = "md",
      variant = "ghost",
      disabled = false,
      loading = false,
      onClick,
      className,
      tabIndex,
    },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(styles.btn, styles[size], styles[variant], className)}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      tabIndex={tabIndex}
    >
      {loading ? <Spinner size="sm" /> : icon}
    </button>
  ),
);

IconButton.displayName = "IconButton";
