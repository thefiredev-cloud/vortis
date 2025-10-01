"use client";

import { motion } from "framer-motion";

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
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.05,
            ease: "easeOut",
          }}
          style={{ display: "inline-block", marginRight: animateBy === "word" ? "0.25em" : "0" }}
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
}
