import SEO from '../components/shared/SEO'

const lastUpdated = new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })

export default function TermsOfUsePage() {
  return (
    <>
      <SEO title="Terms of Use | HAIQ" description="The terms and conditions governing your use of the HAIQ platform." />
      <div style={{ background: '#1A0A00', minHeight: '80vh' }} className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#B8752A' }}>
            Legal
          </p>
          <h1 className="font-serif font-bold text-4xl mb-2" style={{ color: '#F2EAD8' }}>
            HAIQ — Terms of Use
          </h1>
          <div className="w-8 h-px mb-8" style={{ background: '#B8752A' }} />
          <p className="text-sm mb-6" style={{ color: '#8C7355' }}>
            Effective Date: {lastUpdated} | Last Updated: {lastUpdated}
          </p>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#F2EAD8' }}>
            <Section title="1. Who We Are">
              <p>
                HAIQ is a premium handcrafted cookie brand operated from Muyenga, Kampala, Uganda.
                We sell cookies and cookie boxes online for delivery within our service areas. Contact us at{' '}
                <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>haiqafrica@gmail.com</a> for any queries.
              </p>
            </Section>

            <Section title="2. Acceptance of Terms">
              <p>By using this website or placing an order, you confirm that:</p>
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>you are at least 18 years of age, or have the consent of a parent or guardian;</li>
                <li>you have read and agree to these Terms of Use;</li>
                <li>you have read and agree to our Privacy Policy at /privacy-policy;</li>
                <li>you have the legal capacity to enter into a binding contract under Ugandan law.</li>
              </ul>
              <p className="mt-2">If you do not agree with any part of these terms, do not use our platform.</p>
            </Section>

            <Section title="3. Products and Pricing">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>HAIQ sells handcrafted cookies only. All cookies are made in small batches. Minor variations may occur.</li>
                <li>Prices are quoted in UGX inclusive of any applicable taxes and may change without notice.</li>
                <li>
                  The "Box Office" (Build Your Box) price varies based on whether the purchase date is designated as a special day.
                  The applicable price is displayed at checkout and confirmed in your order confirmation.
                </li>
                <li>We reserve the right to limit quantities, decline orders, and discontinue products without prior notice.</li>
              </ul>
            </Section>

            <Section title="4. Orders and Contract Formation">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>Placing an order constitutes an offer to purchase. A contract is formed when we send you an order confirmation email.</li>
                <li>We may refuse or cancel any order at our discretion (stock issues, pricing errors, payment verification, or suspected fraud).</li>
                <li>If we cancel after payment, we will issue a full refund via the original payment method within 5 business days.</li>
              </ul>
            </Section>

            <Section title="5. Delivery">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>We deliver within Kampala and selected surrounding areas. Delivery zones and fees are shown at checkout.</li>
                <li>Estimated delivery times are guidance only. We are not liable for delays outside our control.</li>
                <li>You are responsible for providing a correct and accessible delivery address.</li>
                <li>Risk passes to you upon delivery to the address provided.</li>
              </ul>
            </Section>

            <Section title="6. Payment">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>We accept Cash on Delivery, MTN Mobile Money, Airtel Money, and Bank Transfer.</li>
                <li>For COD, payment is due upon delivery. Refusal without cause may result in suspension.</li>
                <li>We do not store card numbers or mobile money PINs; payment is handled by third parties.</li>
              </ul>
            </Section>

            <Section title="7. Cancellations and Refunds">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>You may cancel before the order status changes to "En Route." Once dispatched, cancellation is unavailable.</li>
                <li>If cancelled before dispatch, any payment will be refunded within 5 business days.</li>
                <li>
                  For damaged or incorrect items, contact us within 24 hours with photos. We may offer a replacement or refund at our discretion.
                </li>
                <li>Food products are non-returnable except for quality issues.</li>
              </ul>
            </Section>

            <Section title="8. Accounts">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>Accounts are optional but required for tracking, loyalty, and messaging.</li>
                <li>You are responsible for maintaining credential confidentiality.</li>
                <li>Provide accurate information and update it as needed.</li>
                <li>We may suspend or terminate accounts for fraud, abuse, or violations.</li>
              </ul>
            </Section>

            <Section title="9. Loyalty Programme">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>The loyalty programme may be modified or discontinued at any time.</li>
                <li>Applications are approved or rejected at our discretion.</li>
                <li>Benefits have no monetary value and are non-transferable.</li>
              </ul>
            </Section>

            <Section title="10. Intellectual Property">
              <p>
                All content — including brand marks, product names, photographs, copy, and code — is the property of HAIQ.
                You may not reproduce or create derivative works without written permission. Personal, non-commercial sharing of links is permitted.
              </p>
            </Section>

            <Section title="11. Prohibited Conduct">
              <p className="mb-2">You must not:</p>
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>use the platform for any unlawful purpose;</li>
                <li>submit false, fraudulent, or misleading information;</li>
                <li>impersonate any person or entity;</li>
                <li>attempt to gain unauthorised access to the platform or our systems;</li>
                <li>scrape or mass-download content;</li>
                <li>submit defamatory, obscene, threatening, or infringing content;</li>
                <li>disrupt or impair normal platform operation.</li>
              </ul>
            </Section>

            <Section title="12. Product Reviews">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>By submitting a review, you grant HAIQ a licence to display it on our platform and marketing.</li>
                <li>Reviews must be honest and relevant; we may remove those that violate standards.</li>
                <li>Approved reviews reflect customer opinions, not HAIQ endorsements.</li>
              </ul>
            </Section>

            <Section title="13. Disclaimer of Warranties">
              <p>
                The platform and products are provided "as is." To the maximum extent permitted by law, HAIQ disclaims warranties of merchantability,
                fitness for a particular purpose, and non-infringement. We do not warrant uninterrupted or error-free operation.
              </p>
            </Section>

            <Section title="14. Limitation of Liability">
              <p>
                To the maximum extent permitted under Ugandan law, HAIQ's total liability for any claim is limited to the amount paid for the order at issue.
                We are not liable for indirect, consequential, or special damages, or for events outside our control. Nothing limits liability for death,
                personal injury, or fraud where not permitted.
              </p>
            </Section>

            <Section title="15. Food Safety and Allergens">
              <p>
                Our cookies are produced in a kitchen that handles wheat (gluten), dairy, eggs, and nuts. Cross-contamination is possible. Ingredient details are
                available on product pages. You are responsible for ensuring suitability for your needs.
              </p>
            </Section>

            <Section title="16. Governing Law and Dispute Resolution">
              <p>
                These Terms are governed by the laws of Uganda. Disputes will first be addressed by contacting us at{' '}
                <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>haiqafrica@gmail.com</a>. Unresolved disputes after 30 days will be referred to
                arbitration in Kampala under CADER rules. Urgent injunctive relief may be sought in Ugandan courts.
              </p>
            </Section>

            <Section title="17. Changes to These Terms">
              <p>
                We may update these Terms from time to time. Material changes will be notified on the platform or by email. Continued use after changes constitutes acceptance.
              </p>
            </Section>

            <Section title="18. Severability and Entire Agreement">
              <p>
                If any provision is invalid, the remainder remains in effect. These Terms and our Privacy Policy form the entire agreement regarding platform use.
              </p>
            </Section>

            <Section title="19. Contact">
              <p>
                HAIQ — Muyenga, Kampala, Uganda · Email:{' '}
                <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>haiqafrica@gmail.com</a> · Website: haiqweb.vercel.app
              </p>
            </Section>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-serif font-bold text-xl mb-2" style={{ color: '#B8752A' }}>{title}</h2>
      <div className="space-y-2 text-[14px] leading-relaxed" style={{ color: '#F2EAD8' }}>
        {children}
      </div>
    </section>
  )
}
