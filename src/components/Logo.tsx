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
  /** "default" renders dark charcoal with orange accents for light backgrounds; "white" renders white with orange accents for dark backgrounds */
  variant?: "default" | "white";
}) {
  const isWhite = variant === "white";

  if (short) {
    const src = isWhite ? skShortWhiteLogo : skShortLogo;
    return (
      <div className="flex items-center shrink-0">
        <img
          src={src}
          alt="Skyrovix"
          className={className || "h-7.5 sm:h-8 w-auto object-contain shrink-0"}
        />
      </div>
    );
  }

  const src = isWhite ? skyrovixWhiteLogo : skyrovixFullLogo;

  return (
    <div className="flex items-center shrink-0">
      <img
        src={src}
        alt="Skyrovix"
        className={className || "h-9 sm:h-11 w-auto object-contain shrink-0"}
      />
    </div>
  );
}
