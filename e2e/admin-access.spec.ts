import { expect, test } from "@playwright/test";

test("studio uses the default media policy", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();
  const allowedTypesMatch = html.match(/allowedTypes:(\[[^\]]+\])/);
  const allowedTypes = allowedTypesMatch
    ? JSON.parse(allowedTypesMatch[1])
    : undefined;

  expect(allowedTypes).toEqual(["image/*", "video/*", "audio/*"]);
});

test("admin routes require GitHub OAuth and are never cached or indexed", async ({
  request,
}) => {
  const adminResponse = await request.get("/admin", { maxRedirects: 0 });

  expect(adminResponse.status()).toBe(302);
  expect(adminResponse.headers()["cache-control"]).toBe("private, no-store");
  expect(adminResponse.headers()["x-robots-tag"]).toBe(
    "noindex, nofollow, noarchive",
  );
  expect(adminResponse.headers().location).toBe("/__nuxt_studio/auth/github");

  const oauthResponse = await request.get(
    adminResponse.headers().location || "",
    { maxRedirects: 0 },
  );
  const redirect = new URL(oauthResponse.headers().location || "");

  expect(oauthResponse.status()).toBe(302);
  expect(oauthResponse.headers()["cache-control"]).toBe("private, no-store");
  expect(oauthResponse.headers()["x-robots-tag"]).toBe(
    "noindex, nofollow, noarchive",
  );
  expect(oauthResponse.headers()["set-cookie"]).toContain("HttpOnly");
  expect(oauthResponse.headers()["set-cookie"]).toContain("SameSite=Lax");
  expect(redirect.origin).toBe("https://github.com");
  expect(redirect.pathname).toBe("/login/oauth/authorize");
  expect(redirect.searchParams.get("client_id")).toBe("test-client");
  expect(redirect.searchParams.get("scope")).toContain("public_repo");
  expect(redirect.searchParams.get("scope")).toContain("user:email");
  expect(redirect.searchParams.get("redirect_uri")).toBe(
    "http://127.0.0.1:4173/__nuxt_studio/auth/github",
  );
});
