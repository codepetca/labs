"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  className: string;
  disabled?: boolean;
  label: string;
  pendingLabel?: string;
};

export function AdminSubmitButton({
  className,
  disabled = false,
  label,
  pendingLabel = "Working",
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={className}
    >
      <span className="inline-flex items-center gap-2">
        {pending ? (
          <span
            aria-hidden="true"
            className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {pending ? pendingLabel : label}
      </span>
    </button>
  );
}
