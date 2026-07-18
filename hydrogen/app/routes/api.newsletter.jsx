import {adminGql} from '~/lib/adminApi';

// Newsletter signup: creates (or updates) a Shopify customer with email
// marketing consent so the list is usable from Shopify Email. Requires the
// almas app to have read_customers/write_customers scopes.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function action({request, context}) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  // Honeypot field: real users never fill it.
  if (form.get('website')) return {ok: true};
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return {ok: false, error: 'Please enter a valid email address.'};
  }

  try {
    const created = await adminGql(
      context.env,
      `mutation($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }`,
      {
        input: {
          email,
          emailMarketingConsent: {
            marketingState: 'SUBSCRIBED',
            marketingOptInLevel: 'SINGLE_OPT_IN',
          },
          tags: ['newsletter'],
        },
      },
    );
    const errs = created.customerCreate.userErrors;
    if (errs.length) {
      const taken = errs.some((e) => /taken|already/i.test(e.message));
      if (!taken) throw new Error(JSON.stringify(errs));
      // Existing customer: flip their consent on instead.
      const found = await adminGql(
        context.env,
        `query($q: String!) { customers(first: 1, query: $q) { nodes { id } } }`,
        {q: `email:${email}`},
      );
      const id = found.customers.nodes[0]?.id;
      if (id) {
        await adminGql(
          context.env,
          `mutation($input: CustomerEmailMarketingConsentUpdateInput!) {
            customerEmailMarketingConsentUpdate(input: $input) {
              userErrors { field message }
            }
          }`,
          {
            input: {
              customerId: id,
              emailMarketingConsent: {
                marketingState: 'SUBSCRIBED',
                marketingOptInLevel: 'SINGLE_OPT_IN',
              },
            },
          },
        );
      }
    }
    return {ok: true};
  } catch (e) {
    console.error('newsletter signup failed:', e);
    return {ok: false, error: 'Something went wrong — please try again later.'};
  }
}

export function loader() {
  throw new Response('Not found', {status: 404});
}
