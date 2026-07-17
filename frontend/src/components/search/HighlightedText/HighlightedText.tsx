import React, { useMemo } from "react";
import { cn } from "../../../utils";
import styles from "./HighlightedText.module.css";

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = React.memo(
  ({ text, query, className }) => {
    const parts = useMemo(() => {
      if (!query.trim()) return [{ text, highlight: false }];

      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const result: { text: string; highlight: boolean }[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          result.push({ text: text.slice(lastIndex, match.index), highlight: false });
        }
        result.push({ text: match[0], highlight: true });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        result.push({ text: text.slice(lastIndex), highlight: false });
      }

      return result.length > 0 ? result : [{ text, highlight: false }];
    }, [text, query]);

    return (
      <span className={cn(styles.container, className)}>
        {parts.map((part, i) =>
          part.highlight ? (
            <mark key={i} className={styles.mark}>
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </span>
    );
  },
);

HighlightedText.displayName = "HighlightedText";
