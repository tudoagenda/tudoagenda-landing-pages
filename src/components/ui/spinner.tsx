interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary";
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-4",
  lg: "w-8 h-8 border-4",
};

const variantClasses = {
  default: "border-purple-200 border-t-purple-900",
  primary: "border-white/30 border-t-white",
  secondary: "border-gray-200 border-t-gray-900",
};

export const Spinner = ({ size = "md", variant = "default" }: SpinnerProps) => {
  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`}
    />
  );
};
