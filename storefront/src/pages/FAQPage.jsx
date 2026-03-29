import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ_SECTIONS = [
  {
    title: 'Ordering',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'Browse our collection, select your preferred size, and add items to your bag. Proceed to checkout, enter your shipping and payment details, and confirm your order. You will receive a confirmation email once your order is placed.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'We begin processing orders quickly to ensure fast delivery. If you need to modify or cancel, please contact us within 1 hour of placing your order. After that, we may not be able to accommodate changes.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are securely processed and encrypted.',
      },
      {
        q: 'Is there a minimum order amount?',
        a: 'There is no minimum order amount. However, orders over $100 qualify for free standard shipping within the United States.',
      },
      {
        q: 'Can I apply multiple promo codes to one order?',
        a: 'Only one promo code can be applied per order. Promo codes cannot be combined with subscription discounts or other promotional offers unless explicitly stated.',
      },
      {
        q: 'Do you offer gift wrapping?',
        a: 'Yes, we offer complimentary gift wrapping on all orders. Simply select the gift wrap option during checkout and include a personalized message if desired.',
      },
    ],
  },
  {
    title: 'Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping within the US takes 5-7 business days. Express shipping (2-3 business days) is available for an additional charge. International shipping typically takes 7-14 business days depending on the destination.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! All orders over $100 qualify for free standard shipping within the United States. Subscription orders always ship free, regardless of the order total.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to over 40 countries worldwide. International shipping rates and delivery times vary by destination. Customs duties and import taxes may apply and are the responsibility of the customer.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order ships, you will receive a confirmation email with a tracking number. You can use this number to track your package on the carrier\'s website or through your account dashboard.',
      },
      {
        q: 'What happens if my package is lost or damaged?',
        a: 'If your package is lost or arrives damaged, please contact our customer service team within 7 days of the expected delivery date. We will arrange a replacement or full refund.',
      },
    ],
  },
  {
    title: 'Returns',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy on all unused, unopened products in their original packaging. If you are not satisfied with your purchase, contact us to initiate a return.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Log into your account and navigate to your order history, or contact our customer service team. We will provide a prepaid return shipping label and instructions.',
      },
      {
        q: 'Can I return a product that has been opened or used?',
        a: 'We understand that fragrance is personal. If you have lightly tested a product and are not satisfied, please reach out to us. We handle these requests on a case-by-case basis.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days of receiving your return. The refund will be applied to your original payment method. Please allow an additional 3-5 business days for the refund to appear on your statement.',
      },
      {
        q: 'Can I exchange a product instead of returning it?',
        a: 'Yes, exchanges are welcome. Contact our team to arrange an exchange for a different size or fragrance. Exchanges are subject to product availability.',
      },
    ],
  },
  {
    title: 'Subscriptions',
    questions: [
      {
        q: 'How does the ALMAS Refill Club work?',
        a: 'Subscribe to your favorite fragrance and receive automatic refills every 3 months at a 15% discount. Every subscription order ships free, and you get exclusive early access to new releases.',
      },
      {
        q: 'Can I skip, swap, or cancel my subscription?',
        a: 'Absolutely. You have full control over your subscription. Skip a delivery, swap to a different fragrance, or cancel anytime through your account dashboard. No commitments, no fees.',
      },
      {
        q: 'When will I be charged for my subscription?',
        a: 'You will be charged 3 days before each scheduled delivery. We will send a reminder email so you have time to make any changes to your order.',
      },
      {
        q: 'Can I change the frequency of my subscription?',
        a: 'Currently, all subscriptions are set to a 3-month refill cycle. We are working on offering flexible frequencies in the future.',
      },
      {
        q: 'Do subscription orders qualify for promo codes?',
        a: 'Subscription orders already include a 15% discount and free shipping. Promo codes generally cannot be stacked with subscription pricing unless a promotion specifically states otherwise.',
      },
      {
        q: 'Can I gift a subscription?',
        a: 'Yes! Gift subscriptions are available. Select any fragrance, choose the subscription option, and enter the recipient\'s shipping details at checkout. You can include a personalized gift message.',
      },
    ],
  },
  {
    title: 'General',
    questions: [
      {
        q: 'Are your fragrances authentic?',
        a: 'ALMAS creates luxury-inspired fragrances using premium ingredients. Each scent is inspired by iconic designer and niche fragrances, crafted to deliver comparable quality at an accessible price point.',
      },
      {
        q: 'How long do your fragrances last?',
        a: 'Our Eau de Parfum formulations are designed for long-lasting wear, typically 6-10 hours depending on the specific fragrance, skin chemistry, and environmental conditions.',
      },
      {
        q: 'Are your products cruelty-free?',
        a: 'Yes. ALMAS is committed to cruelty-free practices. None of our products are tested on animals, and we work with suppliers who share this commitment.',
      },
      {
        q: 'How should I store my fragrances?',
        a: 'Store your fragrances in a cool, dry place away from direct sunlight and extreme temperatures. Avoid storing them in the bathroom where humidity can degrade the scent over time.',
      },
      {
        q: 'Do you have a physical store?',
        a: 'ALMAS is currently an online-only brand, allowing us to offer premium fragrances at accessible prices by reducing overhead costs. We occasionally participate in pop-up events and trunk shows.',
      },
      {
        q: 'How can I contact customer support?',
        a: 'You can reach us via email at support@almasfragrance.com, through our contact page, or via our social media channels. Our team typically responds within 24 hours on business days.',
      },
    ],
  },
]

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-stone-dark/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-serif text-lg pr-8 group-hover:opacity-70 transition-opacity">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-warm-gray shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-warm-gray leading-relaxed pr-12">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Help Center
            <span className="w-8 h-px bg-warm-gray" />
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-warm-gray text-sm max-w-lg mx-auto leading-relaxed">
            Find answers to common questions about ordering, shipping, returns, subscriptions, and more.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-14">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-[11px] tracking-[0.2em] uppercase font-medium mb-6">
                {section.title}
              </h2>
              <div>
                {section.questions.map(({ q, a }) => (
                  <AccordionItem key={q} question={q} answer={a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 text-center bg-light-gray py-16 px-8">
          <h3 className="font-serif text-2xl font-light mb-3">Still Have Questions?</h3>
          <p className="text-sm text-warm-gray mb-8">
            Our customer service team is here to help.
          </p>
          <a
            href="mailto:support@almasfragrance.com"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}
