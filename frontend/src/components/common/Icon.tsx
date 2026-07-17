import React, { Suspense } from 'react';
import { icons } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

const fallback = <span style={{ display: 'inline-flex', width: 24, height: 24 }} />;

export const Icon: React.FC<IconProps> = React.memo(({ name, size = 24, ...props }) => {
  const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const IconComponent = (icons as Record<string, React.FC<LucideProps>>)[kebabName];

  if (!IconComponent) {
    return <span style={{ display: 'inline-flex', width: size, height: size }} data-lucide={name} />;
  }

  return (
    <Suspense fallback={fallback}>
      <IconComponent size={size} {...props} />
    </Suspense>
  );
});

Icon.displayName = 'Icon';
