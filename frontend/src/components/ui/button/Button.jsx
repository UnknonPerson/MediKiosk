import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F6B5B]/40 disabled:cursor-not-allowed disabled:opacity-60";

  const variantStyles = {
    primary:
      "bg-[#0F6B5B] text-white shadow-sm hover:bg-[#0C5A4D] hover:shadow-md active:scale-[0.98]",

    secondary:
      "border border-gray-200 bg-white text-[#1F3A4D] hover:bg-gray-50 hover:border-gray-300",

    outline:
      "border border-[#0F6B5B] bg-transparent text-[#0F6B5B] hover:bg-[#0F6B5B] hover:text-white",

    ghost:
      "bg-transparent text-[#1F3A4D] hover:bg-gray-100",

    dark:
      "bg-[#123C35] text-white hover:bg-[#0B2E29]",
  };

  const sizeStyles = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-7 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="flex items-center">
              {leftIcon}
            </span>
          )}

          {children && <span>{children}</span>}

          {rightIcon && (
            <span className="flex items-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;