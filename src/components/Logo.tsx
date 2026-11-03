import { cn } from "@/lib/utils";
import skyrovixFullLogo from "@/assets/skyrovix-logo-transparent.png";
import skyrovixWhiteLogo from "@/assets/skyrovix-logo-white.png";
import skShortLogo from "@/assets/sk-logo-transparent.png";
import skShortWhiteLogo from "@/assets/sk-logo-white.png";

export function Logo({
  variant = "default",
  short = false,
  className,
}: {
  size?: number;
  withText?: boolean;
  short?: boolean;
  className?: string;
  /** "default" renders dark charcoal with orange accents for light backgrounds (auto-switches to white in dark mode); "white" always renders white with orange accents */
  variant?: "default" | "white";
}) {
  if (variant === "white") {
    const src = short ? skShortWhiteLogo : skyrovixWhiteLogo;
    return (
      <div className="flex items-center shrink-0">
        <img
          src={src}
          alt="Skyrovix"
          className={className || (short ? "h-7.5 sm:h-8 w-auto object-contain shrink-0" : "h-9 sm:h-11 w-auto object-contain shrink-0")}
        />
      </div>
    );
  }

  const darkSrc = short ? skShortLogo : skyrovixFullLogo;
  const whiteSrc = short ? skShortWhiteLogo : skyrovixWhiteLogo;
  const defaultClass = short ? "h-7.5 sm:h-8 w-auto object-contain shrink-0" : "h-9 sm:h-11 w-auto object-contain shrink-0";
  const finalClass = className || defaultClass;

  return (
    <div className="flex items-center shrink-0">
      <img
        src={darkSrc}
        alt="Skyrovix"
        className={cn(finalClass, "dark:hidden")}
      />
      <img
        src={whiteSrc}
        alt="Skyrovix"
        className={cn(finalClass, "hidden dark:block")}
      />
    </div>
  );
}
