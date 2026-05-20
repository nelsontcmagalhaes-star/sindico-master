import * as React from "react";

import { cn } from "@/lib/utils";

// Tipos de input em que o corretor ortográfico não faz sentido
const NO_SPELLCHECK_TYPES = new Set([
  "number",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
  "email",
  "password",
  "tel",
  "url",
  "file",
  "color",
  "range",
  "checkbox",
  "radio",
  "hidden",
]);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, spellCheck, lang, inputMode, ...props }, ref) => {
    const isText = !type || !NO_SPELLCHECK_TYPES.has(type);
    // Não ativa corretor quando o usuário declarou inputMode numérico
    const numericMode = inputMode === "numeric" || inputMode === "decimal" || inputMode === "tel";
    const finalSpellCheck = spellCheck ?? (isText && !numericMode);
    return (
      <input
        type={type}
        spellCheck={finalSpellCheck}
        lang={lang ?? (finalSpellCheck ? "pt-BR" : undefined)}
        inputMode={inputMode}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
