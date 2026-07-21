import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  htmlFor?: string;
};

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={["block text-sm font-medium text-slate-700", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
