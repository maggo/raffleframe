/** @jsxImportSource frog/jsx */

import type { ReactNode } from "react";

export function Container({ children }: { children?: ReactNode }) {
  return (
    <div tw="w-full h-full flex items-center justify-center">{children}</div>
  );
}
