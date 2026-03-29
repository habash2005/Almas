export default function TermsPage() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Legal
            <span className="w-8 h-px bg-warm-gray" />
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Terms & Conditions</h1>
          <p className="text-warm-gray text-sm">Last updated: March 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">1. Agreement to Terms</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              By accessing and using the ALMAS Fragrance website ("Site"), you agree to be bound by these Terms and Conditions ("Terms"), all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">2. Use License</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on ALMAS Fragrance's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Modify or copy the materials
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Use the materials for any commercial purpose or for any public display
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Attempt to decompile or reverse engineer any software contained on the website
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Remove any copyright or other proprietary notations from the materials
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Transfer the materials to another person or mirror them on any other server
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">3. Products & Pricing</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              All product descriptions, images, and pricing on our website are as accurate as possible. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product without notice. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of a product.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              All prices are listed in US Dollars (USD) unless otherwise stated. Applicable taxes will be calculated at checkout based on your shipping address.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">4. Orders & Payment</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              By placing an order on our website, you are making an offer to purchase a product. We reserve the right to refuse or cancel any order for any reason, including but not limited to: product availability, errors in product or pricing information, or suspected fraudulent activity.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              Payment must be received in full before an order is processed and shipped. We accept major credit cards, PayPal, Apple Pay, and Google Pay. All payment information is encrypted and processed securely.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">5. Shipping & Delivery</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              We ship to addresses within the United States and select international destinations. Delivery times are estimates and are not guaranteed. We are not responsible for delays caused by carriers, customs, weather, or other factors beyond our control.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier. Please refer to our Shipping Information page for detailed rates and delivery estimates.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">6. Returns & Refunds</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              We accept returns of unused, unopened products in their original packaging within 30 days of delivery. To initiate a return, please contact our customer service team. Return shipping costs may apply for non-defective returns.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              Refunds will be processed within 5-7 business days of receiving the returned item and applied to the original payment method. We reserve the right to refuse returns that do not meet our return policy requirements.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">7. Subscription Terms</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              By subscribing to the ALMAS Refill Club, you authorize us to charge your payment method every 3 months for the subscription products you have selected, at the discounted subscription price. Subscription orders include free shipping.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              You may skip a delivery, swap your product, or cancel your subscription at any time through your account dashboard. Changes must be made at least 3 days before your next scheduled delivery date. Cancellation does not entitle you to a refund for any previously delivered orders.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              We reserve the right to modify subscription pricing, terms, or available products with reasonable notice. You will be notified of any material changes via email.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">8. Intellectual Property</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              All content on this website, including but not limited to text, graphics, logos, images, audio clips, digital downloads, and data compilations, is the property of ALMAS Fragrance or its content suppliers and is protected by international copyright laws.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              The ALMAS name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of ALMAS Fragrance. You must not use such marks without our prior written permission.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">9. User Accounts</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              We reserve the right to terminate accounts, refuse service, or cancel orders at our sole discretion if we suspect any fraudulent, abusive, or unauthorized activity.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">10. Limitation of Liability</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              In no event shall ALMAS Fragrance, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">11. Governing Law</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of the State of New York.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">12. Changes to Terms</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. Your continued use of the site after any changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">13. Contact Information</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-light-gray p-6">
              <p className="text-sm mb-1"><span className="text-warm-gray">Email:</span> legal@almasfragrance.com</p>
              <p className="text-sm mb-1"><span className="text-warm-gray">Address:</span> ALMAS Fragrance, 123 Luxury Lane, New York, NY 10001</p>
              <p className="text-sm"><span className="text-warm-gray">Phone:</span> (800) 555-ALMAS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
