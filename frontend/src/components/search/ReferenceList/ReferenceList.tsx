import React from "react";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./ReferenceList.module.css";

interface ReferenceItem {
  id: string;
  title: string;
  description: string;
}

interface ReferenceListProps {
  items: ReferenceItem[];
  title?: string;
  className?: string;
}

export const ReferenceList: React.FC<ReferenceListProps> = React.memo(
  ({ items, title, className }) => (
    <div className={cn(styles.container, className)}>
      {title && <h4 className={styles.heading}>{title}</h4>}
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <Icon name="link" size={14} className={styles.linkIcon} />
          <div className={styles.content}>
            <span className={styles.itemTitle}>{item.title}</span>
            <span className={styles.itemDesc}>{item.description}</span>
          </div>
        </div>
      ))}
    </div>
  ),
);

ReferenceList.displayName = "ReferenceList";
