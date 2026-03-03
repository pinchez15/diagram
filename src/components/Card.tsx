import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({ hoverable = false, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-4 ${
        hoverable ? 'transition-shadow hover:shadow-md hover:border-brand-primary cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
