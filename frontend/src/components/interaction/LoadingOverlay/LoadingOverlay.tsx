import React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils";
import { Spinner } from "../../common/Spinner";
import styles from "./LoadingOverlay.module.css";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  blocking?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = React.memo(
  ({ visible, message, blocking = true }) => {
    if (!visible) return null;

    const content = (
      <div
        className={cn(styles.overlay, blocking && styles.blocking)}
        role="alert"
        aria-busy="true"
        aria-label={message ?? "Wird geladen"}
      >
        <div className={styles.content}>
          <Spinner size="lg" />
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    );

    return blocking ? createPortal(content, document.body) : content;
  },
);

LoadingOverlay.displayName = "LoadingOverlay";
