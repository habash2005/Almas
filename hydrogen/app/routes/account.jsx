import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {pageMeta} from '~/lib/seo';

export function shouldRevalidate() {
  return true;
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return pageMeta({title: 'My Account', path: '/account', noindex: true});
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? `Welcome back, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">
            My Account
          </h1>
          <p className="text-warm-gray text-sm">{heading}</p>
        </div>
        <AccountMenu />
        <div className="pt-10">
          <Outlet context={{customer}} />
        </div>
      </div>
    </section>
  );
}

function AccountMenu() {
  function tabClass({isActive, isPending}) {
    return `inline-block pb-3 -mb-px text-[11px] tracking-[0.15em] uppercase whitespace-nowrap border-b transition-colors ${
      isActive
        ? 'text-black border-black'
        : isPending
          ? 'text-warm-gray/60 border-transparent'
          : 'text-warm-gray border-transparent hover:text-black'
    }`;
  }

  return (
    <nav
      role="navigation"
      className="flex items-center gap-8 border-b border-stone-dark/40 overflow-x-auto scrollbar-hide"
    >
      <NavLink to="/account/orders" className={tabClass}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={tabClass}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={tabClass}>
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout" className="ml-auto">
      <button
        type="submit"
        className="inline-block pb-3 text-[11px] tracking-[0.15em] uppercase text-warm-gray hover:text-black transition-colors whitespace-nowrap"
      >
        Sign Out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
