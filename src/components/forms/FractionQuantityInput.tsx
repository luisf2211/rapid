import { forwardRef, type InputHTMLAttributes } from "react";
import { TextInput } from "@/components/forms/TextInput";

const DEFAULT_HINT = "Ej: 1/8, 1 octavo, 2 cuartos, 0.5";

export const FractionQuantityInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    hint?: string;
    containerClassName?: string;
  }
>(function FractionQuantityInput(
  { hint = DEFAULT_HINT, type: _type, inputMode = "text", ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      spellCheck={false}
      hint={hint}
      {...props}
    />
  );
});
