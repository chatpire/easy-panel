import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, type FC } from "react";
import { cn } from "@/lib/utils";

const statisticsItemVariants = cva("flex flex-col gap-2", {
  variants: {
    size: {
      default: "p-3",
      sm: "p-2",
      lg: "p-4",
    },
    align: {
      center: "items-center justify-center",
      start: "items-start",
      end: "items-end",
    },
  },
  defaultVariants: {
    size: "default",
    align: "start",
  },
});

interface StatisticsItemProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof statisticsItemVariants> {
  label: string;
  value: string | string[];
  suffix?: string | string[];
}

export const StatisticsItem: FC<StatisticsItemProps> = ({ value, label, suffix, size, align, className, ...props }) => {
  const isArray = Array.isArray(value);
  const values = isArray ? value : [value];
  const suffixes = Array.isArray(suffix) ? suffix : Array(values.length).fill(suffix);

  return (
    <div className={cn(statisticsItemVariants({ size, align, className }))} {...props}>
      <div className="text-sm text-muted-foreground">{label}</div>
      {values.map((val, idx) => (
        <div key={idx} className="text-xl font-semibold">
          {val}
          {suffixes[idx] && <span className="text-md ml-1 font-medium">{suffixes[idx]}</span>}
        </div>
      ))}
    </div>
  );
};

interface StatisticsGroupItemProps {
  label: string;
  value: string | string[];
  suffix?: string | string[];
}

interface StatisticsGroupProps extends HTMLAttributes<HTMLDivElement> {
  data?: StatisticsGroupItemProps[];
}

export const StatisticsGroup: FC<StatisticsGroupProps> = ({ data, className, children, ...props }) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)} {...props}>
      {data ? data.map((item, idx) => <StatisticsItem key={idx} {...item} />) : children}
    </div>
  );
};
