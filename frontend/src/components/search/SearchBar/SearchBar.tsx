import React, { useCallback, useRef } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ value, onChange, onSubmit, placeholder = "Suchen...", className }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && onSubmit) {
          onSubmit(value);
        }
      },
      [value, onSubmit],
    );

    const handleClear = useCallback(() => {
      onChange("");
      inputRef.current?.focus();
    }, [onChange]);

    return (
      <div className={cn(styles.wrapper, className)}>
        <Icon name="search" size={16} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Sucheingabe löschen"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";
