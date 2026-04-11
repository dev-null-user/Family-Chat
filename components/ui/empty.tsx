import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

type EmptyProps = React.ComponentProps<'div'> & {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

function Empty({ className, icon, title, description, action, children, ...props }: EmptyProps) {
  const composite = icon != null || title != null || description != null || action != null

  if (composite) {
    return (
      <div
        data-slot="empty"
        className={cn(
          'flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-lg border-dashed p-4 text-center text-balance max-md:gap-4 md:gap-6 md:p-12',
          className,
        )}
        {...props}
      >
        <EmptyHeader>
          {icon != null && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
          {title != null && <EmptyTitle>{title}</EmptyTitle>}
          {description != null && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
        {action != null && <EmptyContent>{action}</EmptyContent>}
        {children}
      </div>
    )
  }

  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-lg border-dashed p-4 text-center text-balance max-md:gap-4 md:gap-6 md:p-12',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className,
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg max-md:[&_svg:not([class*='size-'])]:size-5 md:size-10 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-sm font-medium tracking-tight md:text-lg', className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-xs/relaxed max-md:max-w-[18rem] md:text-sm [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-xs text-balance md:gap-4 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
