import { cn } from "@/lib/utils";

type Props = {
  icon: `icon-[${string}--${string}]`;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export function Icon({ icon, className, ...props }: Props) {
  return (
    <div
      className={cn(icon, className)}
      {...props}
    />
  );
}
