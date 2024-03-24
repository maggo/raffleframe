import type { MiddlewareHandler } from "frog";

export const xmtpMiddleware: MiddlewareHandler = async (c, next) => {
  await next();
  const isFrame = c.res.headers.get("content-type")?.includes("html");
  if (isFrame) {
    let html = await c.res.text();

    const metaTag = '<meta property="of:accepts:xmtp" content="2024-02-01" />';
    html = html.replace(/(<head>)/i, `$1${metaTag}`);
    c.res = new Response(html, {
      headers: {
        "content-type": "text/html",
      },
    });
  }
};
