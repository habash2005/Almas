// Server-only Shopify Admin API client for the storefront runtime (reviews,
// newsletter). Uses the same Dev Dashboard app + client-credentials grant as
// the ops scripts; the 24h token is cached in module scope and refreshed
// early. Requires env vars: SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET,
// PUBLIC_STORE_DOMAIN (already present for the storefront client).

let cached = {token: null, expiresAt: 0};

async function getToken(env) {
  if (cached.token && Date.now() < cached.expiresAt) return cached.token;
  const res = await fetch(`https://${env.PUBLIC_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
      client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`admin token exchange failed: HTTP ${res.status}`);
  const body = await res.json();
  // Refresh 5 minutes before the reported expiry (defaults to 24h).
  const ttl = (body.expires_in ?? 86400) * 1000;
  cached = {token: body.access_token, expiresAt: Date.now() + ttl - 300_000};
  return cached.token;
}

export async function adminGql(env, query, variables) {
  const token = await getToken(env);
  const res = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2025-10/graphql.json`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
      body: JSON.stringify({query, variables}),
    },
  );
  if (!res.ok) throw new Error(`admin API HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}
