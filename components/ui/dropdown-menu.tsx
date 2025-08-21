"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DropdownMenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
  className?: string
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, trigger, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn("relative inline-block text-left", className)}
        {...props}
      >
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">{children}</div>
          </div>
        )}
      </div>
    )
  }
)
DropdownMenu.displayName = "DropdownMenu"

export interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuTriggerProps
>(({ children, asChild = false, ...props }, ref) => {
  if (asChild) {
    return <div ref={ref} {...props}>{children}</div>
  }
  return <div ref={ref} {...props}>{children}</div>
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1", className)}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

export interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
  onClick?: () => void
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ children, className, asChild = false, onClick, ...props }, ref) => {
  if (asChild) {
    return <div ref={ref} className={cn("block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer", className)} onClick={onClick} {...props}>{children}</div>
  }
  return <div ref={ref} className={cn("block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer", className)} onClick={onClick} {...props}>{children}</div>
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
