// src/app/api/debug/env/route.js


//Test file for debugging auth

export async function GET() {
  const show = v => (v ? `${v.slice(0,4)}… len=${v.length}` : "undefined");
  return Response.json({
    GOOGLE_CLIENT_ID: show(process.env.GOOGLE_CLIENT_ID || ""),
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "set" : "undefined",
    AUTH_SECRET: show(process.env.AUTH_SECRET || ""),
    NODE_ENV: process.env.NODE_ENV,
  });
}
