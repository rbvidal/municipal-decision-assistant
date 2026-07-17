import React from "react";
import { cn } from "../../../utils";
import { Badge } from "../../common/Badge";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  className?: string;
}

export const TagList: React.FC<TagListProps> = React.memo(({ tags, className }) => (
  <div className={cn(styles.list, className)} role="list" aria-label="Schlagwörter">
    {tags.map((tag) => (
      <Badge key={tag} status="neutral" variant="pill" className={styles.tag}>
        {tag}
      </Badge>
    ))}
  </div>
));

TagList.displayName = "TagList";
