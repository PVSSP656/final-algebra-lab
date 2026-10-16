import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export type MathViewProps = {
  math: string;
  display?: boolean;
  className?: string;
};

export function MathView({
  math,
  display = false,
  className = "",
}: MathViewProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, display]);

  return (
    <span
      className={`math-render ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
