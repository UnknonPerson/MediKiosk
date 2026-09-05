import React from "react";

const Card = ({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  onClick,
}) => {
  const baseStyles =
    "rounded-2xl border transition-all duration-300";

  const variants = {
    default:
      "bg-white border-gray-100 shadow-sm",

    elevated:
      "bg-white border-gray-100 shadow-md",

    outlined:
      "bg-white border-gray-200 shadow-none",

    primary:
      "bg-[#0F6B5B] border-[#0F6B5B] text-white",

    soft:
      "bg-[#F2F8F6] border-[#DDEDE8]",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hover
    ? "hover:-translate-y-1 hover:shadow-xl hover:border-[#B8D9D1] cursor-pointer"
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;