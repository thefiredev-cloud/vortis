"use client";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "word" | "char";
}

export function BlurText({
  text,
  className = "",
  delay = 0,
  animateBy = "word",
}: BlurTextProps) {
  const items = animateBy === "word" ? text.split(" ") : text.split("");

  return (
    <span className={className}>
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="blur-text-item"
          style={{
            animationDelay: `${delay + index * 0.05}s`,
            marginRight: animateBy === "word" ? "0.25em" : "0",
          }}
        >
          {item}
        </span>
      ))}
    </span>
  );
}
