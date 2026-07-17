import React from 'react';
import { cn } from '../../../utils';
import { Icon } from '../Icon';
import styles from './ActivityTimeline.module.css';

export interface TimelineEvent {
  id: string;
  author: string;
  time: string;
  content: string;
  type: 'edit' | 'system';
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = React.memo(({ events, className }) => (
  <div className={cn(styles.timeline, className)} role="list" aria-label="Aktivitätsverlauf">
    {events.map((event) => (
      <div key={event.id} className={styles.entry} role="listitem">
        <div className={cn(styles.node, styles[`node-${event.type}`])} aria-hidden="true">
          {event.type === 'edit' ? (
            <Icon name="edit-2" size={12} />
          ) : (
            <Icon name="settings" size={12} />
          )}
        </div>
        <div className={cn(styles.contentBox, event.type === 'system' && styles.contentSystem)}>
          <div className={styles.header}>
            <span className={styles.author}>{event.author}</span>
            <span className={styles.time}>{event.time}</span>
          </div>
          <p className={styles.text}>{event.content}</p>
        </div>
      </div>
    ))}
  </div>
));

ActivityTimeline.displayName = 'ActivityTimeline';
