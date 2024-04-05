import React from "react";
import { cn } from "@/lib/utils";

const statusVariants = {
  default: "bg-gray-500",
  success: "bg-green-500",
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

const sizeVariants = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

interface StatusLabelProps {
  status?: keyof typeof statusVariants;
  size?: keyof typeof sizeVariants;
  className?: string;
  children?: React.ReactNode;
  pointColor?: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status, size = "sm", children, className, pointColor }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("rounded-full", statusVariants[status ?? "default"], sizeVariants[size], pointColor)} />
      <div className="ml-2">{children}</div>
    </div>
  );
};

export default StatusLabel;
