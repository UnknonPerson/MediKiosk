
const Loading = ({
  size = "md",
  text = "",
  fullScreen = false,
  className = "",
}) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-[5px]",
  };

  const loader = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`
          ${sizes[size]}
          animate-spin
          rounded-full
          border-[#0F6B5B]
          border-t-transparent
        `}
      />

      {text && (
        <p className="text-sm font-medium text-gray-500">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loading;
