import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  `
      inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap
      transition-all outline-none
      focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
      disabled:pointer-events-none disabled:opacity-50
      aria-invalid:border-destructive aria-invalid:ring-destructive/20
      dark:aria-invalid:ring-destructive/40
      [&_svg]:pointer-events-none [&_svg]:shrink-0
      [&_svg:not([class*='size-'])]:size-4
    `,
  {
    variants: {
      variant: {
        default: `
                  bg-primary text-primary-foreground shadow-xs
                  hover:bg-primary/90
                `,
        destructive: `
                  bg-destructive text-white shadow-xs
                  hover:bg-destructive/90
                  focus-visible:ring-destructive/20
                  dark:bg-destructive/60 dark:focus-visible:ring-destructive/40
                `,
        outline: `
                  border bg-background shadow-xs
                  hover:bg-accent hover:text-accent-foreground
                  dark:border-input dark:bg-input/30 dark:hover:bg-input/50
                `,
        secondary: `
                  bg-secondary text-secondary-foreground shadow-xs
                  hover:bg-secondary/80
                `,
        ghost: `
                  hover:bg-accent hover:text-accent-foreground
                  dark:hover:bg-accent/50
                `,
        link: `
                  text-primary underline-offset-4
                  hover:underline
                `,
        pool: `
                  bg-pool-blue text-white shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)]
                  hover:bg-pool-blue-active hover:cursor-pointer
                  active:bg-pool-blue-active active:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]
                `,
      },
      size: {
        default: `
                  h-9 px-4 py-2
                  has-[>svg]:px-3
                `,
        sm: `
                  h-8 gap-1.5 rounded-md px-3
                  has-[>svg]:px-2.5
                `,
        lg: `
                  h-10 rounded-md px-6
                  has-[>svg]:px-4
                `,
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
