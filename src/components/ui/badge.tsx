import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-primary/10 text-primary border-transparent hover:bg-primary/20",
                secondary:
                    "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
                success:
                    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-transparent",
                warning:
                    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent",
                destructive:
                    "bg-destructive/15 text-destructive border-transparent",
                outline:
                    "text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
