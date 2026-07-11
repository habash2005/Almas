import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders — ALMAS'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div>
      <h2 className="font-serif text-2xl font-light mb-8">Order History</h2>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

/**
 * @param {string | undefined} status
 */
function statusColor(status) {
  switch (status) {
    case 'PAID':
    case 'SUCCESS':
    case 'FULFILLED':
      return 'bg-green-50 text-green-700';
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return 'bg-yellow-50 text-yellow-700';
    default:
      return 'bg-light-gray text-warm-gray';
  }
}

/**
 * @param {{
 *   orders: CustomerOrdersFragment['orders'];
 *   filters: OrderFilterParams;
 * }}
 */
function OrdersTable({orders, filters}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div
      aria-live="polite"
      className="[&>div>a]:inline-block [&>div>a]:my-6 [&>div>a]:pb-0.5 [&>div>a]:text-[11px] [&>div>a]:tracking-[0.15em] [&>div>a]:uppercase [&>div>a]:border-b [&>div>a]:border-black [&>div>a]:hover:opacity-70 [&>div>a]:transition-opacity"
    >
      {orders?.nodes.length ? (
        <PaginatedResourceSection
          connection={orders}
          resourcesClassName="space-y-4"
        >
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  return (
    <div className="text-center py-16 bg-light-gray">
      {hasFilters ? (
        <>
          <p className="font-serif text-xl mb-2">No Orders Found</p>
          <p className="text-sm text-warm-gray mb-6">
            No orders matched your search.
          </p>
          <Link
            to="/account/orders"
            className="text-[11px] tracking-[0.15em] uppercase border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
          >
            Clear Filters
          </Link>
        </>
      ) : (
        <>
          <p className="font-serif text-xl mb-2">No Orders Yet</p>
          <p className="text-sm text-warm-gray mb-6">
            Your order history will appear here.
          </p>
          <Link
            to="/collections"
            className="inline-block bg-black text-white px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
          >
            Start Shopping
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   currentFilters: OrderFilterParams;
 * }}
 */
function OrderSearchForm({currentFilters}) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
      className="mb-8"
    >
      <fieldset>
        <legend className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-3">
          Filter Orders
        </legend>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className="flex-1 px-4 py-3 bg-white border border-stone-dark/50 text-sm outline-none focus:border-black transition-colors"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="flex-1 px-4 py-3 bg-white border border-stone-dark/50 text-sm outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-black text-white px-8 py-3 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching' : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
              className="px-8 py-3 border border-stone-dark/50 text-[11px] tracking-[0.15em] uppercase text-warm-gray hover:border-black hover:text-black transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <div className="border border-stone-dark/30 p-6 hover:border-stone-dark/60 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
          >
            #{order.number}
          </Link>
          <span
            className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${statusColor(order.financialStatus)}`}
          >
            {order.financialStatus?.replace(/_/g, ' ')}
          </span>
          {fulfillmentStatus && (
            <span
              className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${statusColor(fulfillmentStatus)}`}
            >
              {fulfillmentStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <span className="text-xs text-warm-gray">
          {new Date(order.processedAt).toDateString()}
        </span>
      </div>
      {order.confirmationNumber && (
        <p className="text-sm text-warm-gray mb-4">
          Confirmation: {order.confirmationNumber}
        </p>
      )}
      <div className="flex justify-between items-center pt-4 border-t border-stone-dark/20">
        <div className="text-sm font-medium">
          <Money data={order.totalPrice} />
        </div>
        <Link
          to={`/account/orders/${btoa(order.id)}`}
          className="text-[11px] tracking-[0.1em] uppercase text-warm-gray hover:text-black transition-colors border-b border-warm-gray hover:border-black pb-0.5"
        >
          View Order
        </Link>
      </div>
    </div>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
