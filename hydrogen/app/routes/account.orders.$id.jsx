import {redirect, useLoaderData} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name} — ALMAS`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

const CELL_LABEL_CLASS =
  'text-[11px] tracking-[0.15em] uppercase text-warm-gray font-normal';

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-light mb-2">
          Order {order.name}
        </h2>
        <p className="text-xs text-warm-gray">
          Placed on {new Date(order.processedAt).toDateString()}
        </p>
        {order.confirmationNumber && (
          <p className="text-xs text-warm-gray mt-1">
            Confirmation: {order.confirmationNumber}
          </p>
        )}
      </div>

      <div className="overflow-x-auto border border-stone-dark/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-light-gray border-b border-stone-dark/30">
              <th scope="col" className={`text-left px-6 py-4 ${CELL_LABEL_CLASS}`}>
                Product
              </th>
              <th scope="col" className={`text-right px-6 py-4 ${CELL_LABEL_CLASS}`}>
                Price
              </th>
              <th scope="col" className={`text-right px-6 py-4 ${CELL_LABEL_CLASS}`}>
                Quantity
              </th>
              <th scope="col" className={`text-right px-6 py-4 ${CELL_LABEL_CLASS}`}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr className="border-t border-stone-dark/20">
                <th
                  scope="row"
                  colSpan={3}
                  className={`text-right px-6 py-3 ${CELL_LABEL_CLASS}`}
                >
                  Discounts
                </th>
                <td className="text-right px-6 py-3">
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </td>
              </tr>
            )}
            <tr className="border-t border-stone-dark/20">
              <th
                scope="row"
                colSpan={3}
                className={`text-right px-6 py-3 ${CELL_LABEL_CLASS}`}
              >
                Subtotal
              </th>
              <td className="text-right px-6 py-3">
                <Money data={order.subtotal} />
              </td>
            </tr>
            <tr>
              <th
                scope="row"
                colSpan={3}
                className={`text-right px-6 py-3 ${CELL_LABEL_CLASS}`}
              >
                Tax
              </th>
              <td className="text-right px-6 py-3">
                <Money data={order.totalTax} />
              </td>
            </tr>
            <tr className="border-t border-stone-dark/30">
              <th
                scope="row"
                colSpan={3}
                className={`text-right px-6 py-4 ${CELL_LABEL_CLASS}`}
              >
                Total
              </th>
              <td className="text-right px-6 py-4 font-medium">
                <Money data={order.totalPrice} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="border border-stone-dark/30 p-6">
          <h3 className="text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-4">
            Shipping Address
          </h3>
          {order?.shippingAddress ? (
            <address className="not-italic text-sm text-warm-gray space-y-1">
              <p className="text-black">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : (
                ''
              )}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : (
                ''
              )}
            </address>
          ) : (
            <p className="text-sm text-warm-gray">No shipping address defined</p>
          )}
        </div>
        <div className="border border-stone-dark/30 p-6">
          <h3 className="text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-4">
            Status
          </h3>
          <span className="inline-block text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 bg-light-gray text-black">
            {fulfillmentStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="inline-block bg-black text-white px-8 py-4 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
        >
          View Order Status
        </a>
      </div>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <tr key={lineItem.id} className="border-b border-stone-dark/20 last:border-b-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {lineItem?.image && (
            <div className="w-16 h-16 bg-light-gray shrink-0">
              <Image data={lineItem.image} width={96} height={96} />
            </div>
          )}
          <div>
            <p className="text-sm">{lineItem.title}</p>
            {lineItem.variantTitle && (
              <p className="text-xs text-warm-gray mt-0.5">
                {lineItem.variantTitle}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="text-right px-6 py-4 text-warm-gray">
        <Money data={lineItem.price} />
      </td>
      <td className="text-right px-6 py-4 text-warm-gray">
        {lineItem.quantity}
      </td>
      <td className="text-right px-6 py-4">
        <Money data={lineItem.totalDiscount} />
      </td>
    </tr>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
