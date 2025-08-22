import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
  <input
      ref={ref}
      className={cn(
    "w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-[inset_0_0_0_9999px_rgba(255,255,255,0.6)] backdrop-blur focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-400",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
