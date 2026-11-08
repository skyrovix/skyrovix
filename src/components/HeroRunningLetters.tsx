import React, { useState, useEffect } from "react";

interface HeroRunningLettersProps {
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

const DEFAULT_ROTATING_WORDS = [
  "Get Certified.",
  "Launch Your Career.",
  "Earn Verified LOR.",
  "Become Industry Ready.",
  "Land Your Dream Job.",
];

export function HeroRunningLetters({
  words = DEFAULT_ROTATING_WORDS,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseDuration = 2500,
  className = "",
}: HeroRunningLettersProps) {
  const [mounted, setMounted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(words[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const currentFullWord = words[wordIndex] ?? words[0];

    // If fully typed, pause before deleting
    if (!isDeleting && displayedText === currentFullWord) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timeout);
    }

    // If fully deleted, switch to next word
    if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    // Typing or backspacing step
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(() => {
      setDisplayedText((prev) => {
        if (isDeleting) {
          return currentFullWord.substring(0, prev.length - 1);
        } else {
          return currentFullWord.substring(0, prev.length + 1);
        }
      });
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, wordIndex, mounted, words, typingSpeed, deletingSpeed, pauseDuration]);

  // Clean, crisp rendering with zero blurry glow/shadows
  const currentText = mounted ? displayedText : words[0];

  return (
    <span
      className={`relative inline-flex items-center min-h-[1.15em] align-baseline select-none ${className}`}
      aria-label={words[wordIndex] ?? words[0]}
    >
      {/* Razor-sharp, clean gradient text without any blurry background or glow */}
      <span className="font-display font-extrabold tracking-tight bg-gradient-to-r from-[#f95c4b] via-[#ee9590] to-[#f95c4b] bg-clip-text text-transparent">
        {currentText}
      </span>

      {/* Clean, crisp blinking vertical cursor */}
      <span
        aria-hidden="true"
        className="inline-block w-[3px] sm:w-[3.5px] h-[0.88em] ml-1.5 align-middle rounded-full bg-[#f95c4b] animate-[typing-cursor_0.8s_ease-in-out_infinite]"
      />
    </span>
  );
}
