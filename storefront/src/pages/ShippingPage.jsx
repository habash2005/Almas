import { Link } from 'react-router-dom'
import { Truck, Globe, Clock, Package } from 'lucide-react'

const DOMESTIC_RATES = [
  { method: 'Standard Shipping', time: '5-7 business days', cost: '$8.95', note: 'Free on orders over $100' },
  { method: 'Express Shipping', time: '2-3 business days', cost: '$14.95', note: '' },
  { method: 'Overnight Shipping', time: '1 business day', cost: '$24.95', note: 'Order by 2 PM ET' },
  { method: 'Subscription Orders', time: '5-7 business days', cost: 'Free', note: 'Always free shipping' },
]

const INTERNATIONAL_RATES = [
  { region: 'Canada', time: '7-10 business days', cost: '$12.95' },
  { region: 'United Kingdom', time: '8-12 business days', cost: '$16.95' },
  { region: 'Europe (EU)', time: '10-14 business days', cost: '$18.95' },
  { region: 'Australia / New Zealand', time: '10-14 business days', cost: '$22.95' },
  { region: 'Middle East (UAE, KSA)', time: '7-10 business days', cost: '$19.95' },
  { region: 'Rest of World', time: '14-21 business days', cost: '$24.95' },
]

export default function ShippingPage() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Information
            <span className="w-8 h-px bg-warm-gray" />
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Shipping Information</h1>
          <p className="text-warm-gray text-sm max-w-lg mx-auto leading-relaxed">
            We ship worldwide with care, ensuring your fragrances arrive safely and promptly.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Truck, label: 'Free Shipping', desc: 'Orders over $100' },
            { icon: Clock, label: 'Fast Delivery', desc: 'As fast as overnight' },
            { icon: Globe, label: 'Global Shipping', desc: '40+ countries' },
            { icon: Package, label: 'Secure Packaging', desc: 'Fragrance-safe' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center py-8 bg-light-gray">
              <Icon className="w-6 h-6 mx-auto mb-3 text-warm-gray" strokeWidth={1.2} />
              <p className="text-sm font-medium mb-1">{label}</p>
              <p className="text-xs text-warm-gray">{desc}</p>
            </div>
          ))}
        </div>

        {/* Domestic Shipping */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-light mb-8">Domestic Shipping (United States)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4 pr-4">
                    Method
                  </th>
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4 pr-4">
                    Delivery Time
                  </th>
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4 pr-4">
                    Cost
                  </th>
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {DOMESTIC_RATES.map((rate) => (
                  <tr key={rate.method} className="border-b border-stone-dark/30">
                    <td className="py-4 pr-4 text-sm">{rate.method}</td>
                    <td className="py-4 pr-4 text-sm text-warm-gray">{rate.time}</td>
                    <td className="py-4 pr-4 text-sm font-medium">{rate.cost}</td>
                    <td className="py-4 text-sm text-warm-gray italic">{rate.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* International Shipping */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-light mb-8">International Shipping</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4 pr-4">
                    Region
                  </th>
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4 pr-4">
                    Delivery Time
                  </th>
                  <th className="text-[11px] tracking-[0.12em] uppercase text-warm-gray font-medium py-4">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {INTERNATIONAL_RATES.map((rate) => (
                  <tr key={rate.region} className="border-b border-stone-dark/30">
                    <td className="py-4 pr-4 text-sm">{rate.region}</td>
                    <td className="py-4 pr-4 text-sm text-warm-gray">{rate.time}</td>
                    <td className="py-4 text-sm font-medium">{rate.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-10">
          <div>
            <h3 className="font-serif text-xl font-light mb-4">Processing Time</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              Orders are typically processed within 1-2 business days. During peak seasons or promotional periods, processing may take an additional 1-2 business days. You will receive a shipping confirmation email with tracking information once your order has shipped.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-light mb-4">Customs & Duties</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              International orders may be subject to customs duties, import taxes, or other fees imposed by the destination country. These charges are the responsibility of the customer and are not included in the order total. Please check with your local customs office for more information.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-light mb-4">Packaging</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              All fragrances are carefully packaged in protective materials to ensure they arrive in perfect condition. Each order includes a branded ALMAS box and tissue paper. Gift wrapping is available at no extra charge during checkout.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-light mb-4">Lost or Damaged Shipments</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              If your order is lost in transit or arrives damaged, please contact us within 7 days of the expected delivery date. We will arrange a replacement shipment or full refund at no additional cost to you.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-light-gray py-12 px-8">
          <h3 className="font-serif text-xl font-light mb-3">Need Help With Shipping?</h3>
          <p className="text-sm text-warm-gray mb-6">
            Contact our support team for any shipping-related questions.
          </p>
          <Link
            to="/faq"
            className="text-[11px] tracking-[0.15em] uppercase text-black border-b border-black pb-1 hover:opacity-60 transition-opacity"
          >
            View FAQ
          </Link>
        </div>
      </div>
    </section>
  )
}
