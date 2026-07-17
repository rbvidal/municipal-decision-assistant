import React from "react";
import { Dialog } from "../Dialog";
import { Button } from "../../common/Button";
import { Icon } from "../../common/Icon";
import type { Variant } from "../../../types";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  mode?: "danger" | "warning" | "info";
}

const config: Record<string, { variant: Variant; icon: string; className: string }> = {
  danger: { variant: "danger", icon: "alert-triangle", className: styles.danger },
  warning: { variant: "primary", icon: "alert-circle", className: styles.warning },
  info: { variant: "primary", icon: "info", className: styles.info },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(
  ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Bestätigen",
    cancelLabel = "Abbrechen",
    mode = "info",
  }) => {
    const cfg = config[mode];

    return (
      <Dialog
        open={open}
        onClose={onClose}
        size="sm"
        ariaLabel={title}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button
              variant={cfg.variant}
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        <div className={cfg.className}>
          <Icon name={cfg.icon} size={24} className={styles.icon} />
          <div>
            <p className={styles.confirmTitle}>{title}</p>
            <p className={styles.confirmDesc}>{description}</p>
          </div>
        </div>
      </Dialog>
    );
  },
);

ConfirmDialog.displayName = "ConfirmDialog";
