/** @jsxImportSource frog/jsx */

import type { ReactNode } from "react";

export function Container({ children }: { children?: ReactNode }) {
  return (
    <div tw="w-full h-full flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bg.png"
        tw="absolute left-0 top-0"
        width="100%"
        height="100%"
        alt=""
      />
      {children}
    </div>
  );
}
