import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: 'text' | 'rectangle' | 'circle'
}

const shapeClasses = {
  text: 'h-4 rounded-md',
  rectangle: 'rounded-xl',
  circle: 'aspect-square rounded-full',
}

export function Skeleton({ shape = 'rectangle', className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse bg-ink-700 motion-reduce:animate-none',
        shapeClasses[shape],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
