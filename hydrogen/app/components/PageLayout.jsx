import {Aside} from '~/components/Aside';
import AnnouncementBar from '~/components/AnnouncementBar';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import ScrollToTop from '~/components/ScrollToTop';

/**
 * Almas layout shell. Receives the root-loader data (cart, header, footer,
 * isLoggedIn, publicStoreDomain) spread from root.jsx — currently unused,
 * but kept in the signature so future tasks can consume it.
 * TODO(task-6): pass `cart` through to the CartDrawer.
 *
 * @param {PageLayoutProps}
 */
export function PageLayout({children = null}) {
  return (
    /* Aside.Provider kept so scaffold route components (CartMain, ProductForm,
       predictive search) that call useAside() keep working.
       TODO(task-6): remove with scaffold cart */
    <Aside.Provider>
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </Aside.Provider>
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
