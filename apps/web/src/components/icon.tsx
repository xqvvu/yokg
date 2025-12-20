import { cn } from "@/lib/utils";

type Props = {
  /**
   * Iconify design format
   * @see https://icon-sets.iconify.design/
   * @example icon="icon-[solar--chat-round-like-outline]"
   */
  icon: `icon-[${string}--${string}]`;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Icon({ icon, className, ...props }: Props) {
  return (
    <div
      className={cn(icon, className)}
      {...props}
    />
  );
}
