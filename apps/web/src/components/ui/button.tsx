import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-[200ms] ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-[1px]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-secondary hover:text-foreground hover:shadow-md hover:-translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-[1px]",
        ghost:
          "hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-[1px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 gap-2",
        xs: "h-7 rounded-lg px-2 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-xl px-3 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 rounded-xl px-8 text-base gap-2",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
