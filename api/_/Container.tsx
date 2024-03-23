import type { PropsWithChildren } from "hono/jsx";

export function Container({ children }: PropsWithChildren) {
  return (
    <div tw="w-full h-full flex items-center justify-center">{children}</div>
  );
}
