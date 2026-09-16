const LOGOS = [
  // Scattered across hero — mobile-safe positions (left max 85%)
  { top: "4%",   left: "5%",   delay: "0s",    sizeMd: 48, sizeSm: 32, src: "https://cdn.simpleicons.org/html5/E34F26",             label: "HTML5" },
  { top: "4%",   left: "60%",  delay: "0.8s",  sizeMd: 44, sizeSm: 30, src: "https://cdn.simpleicons.org/javascript/F7DF1E",         label: "JS" },
  { top: "4%",   left: "82%",  delay: "1.4s",  sizeMd: 44, sizeSm: 30, src: "https://cdn.simpleicons.org/typescript/3178C6",         label: "TS" },

  { top: "18%",  left: "3%",   delay: "0.5s",  sizeMd: 50, sizeSm: 34, src: "https://cdn.simpleicons.org/python/3776AB",             label: "Python" },
  { top: "16%",  left: "45%",  delay: "1.2s",  sizeMd: 44, sizeSm: 28, src: "https://cdn.simpleicons.org/react/61DAFB",              label: "React" },
  { top: "18%",  left: "80%",  delay: "0.3s",  sizeMd: 46, sizeSm: 30, src: "https://cdn.simpleicons.org/nextdotjs/000000",          label: "Next" },

  { top: "34%",  left: "6%",   delay: "1.6s",  sizeMd: 46, sizeSm: 30, src: "https://cdn.simpleicons.org/nodedotjs/339933",          label: "Node" },
  { top: "32%",  left: "82%",  delay: "0.9s",  sizeMd: 44, sizeSm: 28, src: "https://cdn.simpleicons.org/tailwindcss/06B6D4",        label: "Tailwind" },

  { top: "50%",  left: "3%",   delay: "0.4s",  sizeMd: 44, sizeSm: 30, src: "https://cdn.simpleicons.org/mongodb/47A248",            label: "Mongo" },
  { top: "48%",  left: "38%",  delay: "1.9s",  sizeMd: 40, sizeSm: 26, src: "https://cdn.simpleicons.org/mysql/4479A1",              label: "MySQL" },
  { top: "50%",  left: "78%",  delay: "0.7s",  sizeMd: 46, sizeSm: 30, src: "https://cdn.simpleicons.org/docker/2496ED",             label: "Docker" },

  { top: "65%",  left: "5%",   delay: "1.1s",  sizeMd: 44, sizeSm: 28, src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",  label: "AWS" },
  { top: "63%",  left: "50%",  delay: "0.2s",  sizeMd: 42, sizeSm: 28, src: "https://cdn.simpleicons.org/git/F05032",                label: "Git" },
  { top: "65%",  left: "82%",  delay: "1.5s",  sizeMd: 44, sizeSm: 28, src: "https://cdn.simpleicons.org/firebase/FFCA28",           label: "Firebase" },

  { top: "80%",  left: "3%",   delay: "0.6s",  sizeMd: 44, sizeSm: 28, src: "https://cdn.simpleicons.org/flutter/02569B",            label: "Flutter" },
  { top: "78%",  left: "42%",  delay: "1.3s",  sizeMd: 42, sizeSm: 26, src: "https://cdn.simpleicons.org/cplusplus/00599C",          label: "C++" },
  { top: "80%",  left: "80%",  delay: "2.0s",  sizeMd: 44, sizeSm: 28, src: "https://cdn.simpleicons.org/linux/FCC624",              label: "Linux" },
];

export function MobileFloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {LOGOS.map((l, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: l.top,
            left: l.left,
            willChange: "transform",
            animation: `float ${3.5 + (i % 4) * 0.6}s ease-in-out ${l.delay} infinite alternate`,
            zIndex: 1,
          }}
        >
          {/* Mobile size */}
          <img
            src={l.src}
            alt={l.label}
            title={l.label}
            loading="lazy"
            className="block sm:hidden"
            style={{
              width: l.sizeSm,
              height: l.sizeSm,
              opacity: 0.12,
              filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.10))",
            }}
          />
          {/* Desktop size */}
          <img
            src={l.src}
            alt={l.label}
            title={l.label}
            loading="lazy"
            className="hidden sm:block"
            style={{
              width: l.sizeMd,
              height: l.sizeMd,
              opacity: 0.18,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
            }}
          />
        </div>
      ))}
    </div>
  );
}
