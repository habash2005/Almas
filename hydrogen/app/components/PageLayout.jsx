import AnnouncementBar from '~/components/AnnouncementBar';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import ScrollToTop from '~/components/ScrollToTop';
import CartDrawer from '~/components/CartDrawer';

/**
 * Almas layout shell. Receives the root-loader data (cart, header, footer,
 * isLoggedIn, publicStoreDomain) spread from root.jsx — currently unused,
 * but kept in the signature so future tasks can consume it. Cart data is
 * read by Navbar/CartDrawer via useAlmasCart() (root loader + CartUIProvider).
 *
 * @param {PageLayoutProps}
 */
export function PageLayout({children = null}) {
  return (
    <>
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {CartApiQueryFragment|null} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
