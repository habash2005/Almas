// Configures the store's shipping zones and rates to match the storefront's
// published shipping policy (storefront/src/pages/ShippingPage.jsx):
//   US:      Standard $8.95 (free over $100), Express $14.95, Overnight $24.95
//   Canada:  $12.95 | UK: $16.95 | EU: $18.95 | AU/NZ: $22.95
//   Middle East (AE, SA): $19.95 | Rest of World: $24.95
// Idempotent: replaces all zones in the default delivery profile's default
// location group with the canonical set above. Safe to re-run.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/configure-shipping.mjs
// Requires app scopes: read_shipping, write_shipping.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
let TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!DOMAIN || (!TOKEN && !(CLIENT_ID && CLIENT_SECRET))) {
  console.error('Set SHOPIFY_STORE_DOMAIN plus SHOPIFY_ADMIN_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;

async function fetchAccessToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: HTTP ${res.status}`);
  const body = await res.json();
  if (!body.scope?.includes('write_shipping')) {
    throw new Error(`token lacks write_shipping (scopes: ${body.scope}) — release an app version with read_shipping+write_shipping and approve it on the store`);
  }
  return body.access_token;
}

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN},
    body: JSON.stringify({query, variables}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}

const usd = (amount) => ({amount, currencyCode: 'USD'});

const rate = (name, amount, priceConditions) => ({
  name,
  active: true,
  rateDefinition: {price: usd(amount)},
  ...(priceConditions ? {priceConditionsToCreate: priceConditions} : {}),
});

const EU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
const countries = (codes) => codes.map((code) => ({code, includeAllProvinces: true}));

const ZONES = [
  {
    name: 'United States',
    countries: countries(['US']),
    methodDefinitionsToCreate: [
      rate('Standard Shipping (5-7 business days)', 8.95, [
        {criteria: usd(100), operator: 'LESS_THAN_OR_EQUAL_TO'},
      ]),
      rate('Free Shipping (5-7 business days)', 0, [
        {criteria: usd(100), operator: 'GREATER_THAN_OR_EQUAL_TO'},
      ]),
      rate('Express Shipping (2-3 business days)', 14.95),
      rate('Overnight Shipping (1 business day)', 24.95),
    ],
  },
  {name: 'Canada', countries: countries(['CA']), methodDefinitionsToCreate: [rate('Standard International (7-10 business days)', 12.95)]},
  {name: 'United Kingdom', countries: countries(['GB']), methodDefinitionsToCreate: [rate('Standard International (8-12 business days)', 16.95)]},
  {name: 'Europe (EU)', countries: countries(EU), methodDefinitionsToCreate: [rate('Standard International (10-14 business days)', 18.95)]},
  {name: 'Australia & New Zealand', countries: countries(['AU', 'NZ']), methodDefinitionsToCreate: [rate('Standard International (10-14 business days)', 22.95)]},
  {name: 'Middle East', countries: countries(['AE', 'SA']), methodDefinitionsToCreate: [rate('Standard International (7-10 business days)', 19.95)]},
  {name: 'Rest of World', countries: [{restOfWorld: true}], methodDefinitionsToCreate: [rate('Standard International (14-21 business days)', 24.95)]},
];

const PROFILE_QUERY = `
  query {
    deliveryProfiles(first: 5) {
      nodes {
        id
        name
        default
        profileLocationGroups {
          locationGroup { id }
          locationGroupZones(first: 30) {
            nodes { zone { id name } }
          }
        }
      }
    }
  }`;

const PROFILE_UPDATE = `
  mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }`;

if (!TOKEN) TOKEN = await fetchAccessToken();

const data = await gql(PROFILE_QUERY);
const profile = data.deliveryProfiles.nodes.find((p) => p.default) ?? data.deliveryProfiles.nodes[0];
if (!profile) throw new Error('no delivery profile found');
const group = profile.profileLocationGroups[0];
if (!group) throw new Error('delivery profile has no location group');
const existingZones = group.locationGroupZones.nodes.map((n) => n.zone);
console.log(`Profile: ${profile.name} (default: ${profile.default})`);
console.log(`Existing zones: ${existingZones.map((z) => z.name).join(', ') || '(none)'}`);

const result = await gql(PROFILE_UPDATE, {
  id: profile.id,
  profile: {
    zonesToDelete: existingZones.map((z) => z.id),
    locationGroupsToUpdate: [
      {
        id: group.locationGroup.id,
        zonesToCreate: ZONES,
      },
    ],
  },
});
const errs = result.deliveryProfileUpdate.userErrors;
if (errs.length) throw new Error(JSON.stringify(errs, null, 2));
console.log(`Replaced ${existingZones.length} zone(s) with ${ZONES.length} canonical zones.`);

// Verify
const after = await gql(PROFILE_QUERY);
const zonesAfter = (after.deliveryProfiles.nodes.find((p) => p.id === profile.id) ?? {})
  .profileLocationGroups?.[0]?.locationGroupZones.nodes.map((n) => n.zone.name) ?? [];
console.log(`Zones now: ${zonesAfter.join(', ')}`);
console.log('Done. Review at Settings → Shipping and delivery.');
