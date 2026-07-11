import {CartForm} from '@shopify/hydrogen';
import {useAlmasCart} from '~/lib/cart';

/**
 * Renders children inside a CartForm submit button. Submitting adds the
 * given lines to the Shopify cart (via the /cart route action) and opens
 * the cart drawer, matching the legacy addToCart() behavior.
 *
 * @param {{
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: (e: React.MouseEvent) => void;
 *   className?: string;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 * }}
 */
export function AddToCartButton({lines, onClick, className, children, disabled}) {
  const {setIsCartOpen} = useAlmasCart();

  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines}}>
      {(fetcher) => (
        <button
          type="submit"
          className={className}
          disabled={disabled || fetcher.state !== 'idle'}
          onClick={(e) => {
            e.stopPropagation();
            setIsCartOpen(true);
            onClick?.(e);
          }}
        >
          {children}
        </button>
      )}
    </CartForm>
  );
}

/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
