export default function PrivacyPage() {
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
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Privacy Policy</h1>
          <p className="text-warm-gray text-sm">Last updated: March 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">1. Introduction</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              ALMAS Fragrance ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make a purchase, or interact with our services.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              By using our website and services, you consent to the data practices described in this policy. If you do not agree with the terms of this policy, please do not access our website.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">2. Information We Collect</h2>
            <h3 className="text-sm font-medium mb-2">Personal Information</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              When you make a purchase, create an account, or subscribe to our newsletter, we may collect personal information including but not limited to: your name, email address, mailing address, phone number, and payment information.
            </p>
            <h3 className="text-sm font-medium mb-2">Automatically Collected Information</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              When you access our website, we may automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
            </p>
            <h3 className="text-sm font-medium mb-2">Order Information</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              When you make a purchase or attempt to make a purchase through the site, we collect order information including your name, billing address, shipping address, payment information, email address, and phone number.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">3. How We Use Your Information</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Process and fulfill your orders, including shipping and payment processing
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Communicate with you about your orders, subscriptions, and account
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Send promotional emails and newsletters (with your consent)
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Improve our website, products, and customer experience
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Detect and prevent fraud or unauthorized transactions
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Comply with legal obligations and enforce our terms
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">4. Information Sharing</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. These include:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Payment processors for secure transaction handling
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Shipping carriers for order delivery
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Email service providers for communications
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                Analytics providers for website improvement
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">5. Cookies & Tracking</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              We use cookies for session management, remembering your preferences, analytics, and to improve your browsing experience. Essential cookies are required for the website to function properly.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">6. Data Security</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">7. Your Rights</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the following rights regarding your personal information:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                The right to access and receive a copy of your personal data
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                The right to correct inaccurate personal data
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                The right to request deletion of your personal data
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                The right to opt out of marketing communications
              </li>
              <li className="text-sm text-warm-gray leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-gray rounded-full mt-2 shrink-0" />
                The right to data portability
              </li>
            </ul>
            <p className="text-sm text-warm-gray leading-relaxed mt-4">
              To exercise any of these rights, please contact us at privacy@almasfragrance.com.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">8. Third-Party Links</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policy of every website you visit.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">9. Children's Privacy</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              Our website and services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to remove that information.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">10. Changes to This Policy</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our website after any changes constitutes acceptance of the revised policy.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl md:text-2xl font-light mb-4">11. Contact Us</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 bg-light-gray p-6">
              <p className="text-sm mb-1"><span className="text-warm-gray">Email:</span> privacy@almasfragrance.com</p>
              <p className="text-sm mb-1"><span className="text-warm-gray">Address:</span> ALMAS Fragrance, 123 Luxury Lane, New York, NY 10001</p>
              <p className="text-sm"><span className="text-warm-gray">Phone:</span> (800) 555-ALMAS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
