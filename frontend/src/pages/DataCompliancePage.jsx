import SEO from '../components/shared/SEO'

export default function DataCompliancePage() {
  return (
    <>
      <SEO
        title="Data & Compliance | HAIQ"
        description="Our data practices, retention policies, and your rights under Ugandan law."
      />
      <div style={{ background: '#1A0A00', minHeight: '80vh' }} className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#B8752A' }}>
            Legal
          </p>
          <h1 className="font-serif font-bold text-4xl mb-2" style={{ color: '#F2EAD8' }}>
            Data & Compliance
          </h1>
          <div className="w-8 h-px mb-8" style={{ background: '#B8752A' }} />

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#F2EAD8' }}>
            <Section title="Data We Collect and Why">
              <ol className="list-decimal pl-5 space-y-4 text-[13px]" style={{ color: '#8C7355' }}>
                <li>
                  <strong className="text-light">Account Data:</strong> Full name, email, phone, and hashed password for account management
                  and order attribution. Basis: performance of a contract.
                </li>
                <li>
                  <strong className="text-light">Order Data:</strong> Names, email, phone, delivery address, notes, gift notes, items, and payment method
                  for fulfilment and delivery. Basis: performance of a contract.
                </li>
                <li>
                  <strong className="text-light">Payment Data:</strong> We store transaction references only (no card numbers or mobile money PINs)
                  for reconciliation. Basis: payment verification and records.
                </li>
                <li>
                  <strong className="text-light">Communications Data:</strong> Message content and related order info for support and dispute resolution.
                </li>
                <li>
                  <strong className="text-light">Loyalty Programme Data:</strong> Delivery address and phone for loyalty card dispatch and status tracking.
                </li>
                <li>
                  <strong className="text-light">Newsletter Data:</strong> Name and email for marketing with consent; unsubscribe anytime.
                </li>
                <li>
                  <strong className="text-light">Technical Data:</strong> IP, browser type, and general location from host logs (Vercel, Render) for security
                  and debugging; retained up to 30 days.
                </li>
                <li>
                  <strong className="text-light">Cookie Data:</strong> Necessary session cookies only; no advertising trackers.
                </li>
              </ol>
            </Section>

            <Section title="How Long We Keep Your Data">
              <div className="overflow-auto">
                <table className="w-full text-left text-xs" style={{ color: '#F2EAD8', borderColor: 'rgba(184,117,42,0.25)' }}>
                  <thead>
                    <tr style={{ color: '#B8752A' }}>
                      <th className="border-b px-3 py-2">Data Type</th>
                      <th className="border-b px-3 py-2">Retention Period</th>
                      <th className="border-b px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Account data', 'Until deletion + 1 year', 'Dispute resolution'],
                      ['Order data', '7 years from order date', 'Accounting law'],
                      ['Payment references', '7 years', 'Accounting law'],
                      ['Messages', '3 years from last interaction', 'Customer support'],
                      ['Newsletter data', 'Until unsubscribe + 6 months', 'Suppression list'],
                      ['Technical logs', 'Up to 30 days', 'Security monitoring'],
                      ['Loyalty card data', 'Programme duration + 2 years', 'Programme administration'],
                    ].map(([type, period, reason]) => (
                      <tr key={type} className="border-b border-primary/20">
                        <td className="px-3 py-2 align-top" style={{ color: '#F2EAD8' }}>{type}</td>
                        <td className="px-3 py-2 align-top" style={{ color: '#8C7355' }}>{period}</td>
                        <td className="px-3 py-2 align-top" style={{ color: '#8C7355' }}>{reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Who We Share Your Data With">
              <div className="overflow-auto">
                <table className="w-full text-left text-xs" style={{ color: '#F2EAD8', borderColor: 'rgba(184,117,42,0.25)' }}>
                  <thead>
                    <tr style={{ color: '#B8752A' }}>
                      <th className="border-b px-3 py-2">Service Provider</th>
                      <th className="border-b px-3 py-2">Purpose</th>
                      <th className="border-b px-3 py-2">Data Shared</th>
                      <th className="border-b px-3 py-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[ 
                      ['Neon (neon.tech)', 'Database hosting', 'Platform data', 'US (East)'],
                      ['Vercel (vercel.com)', 'Frontend hosting', 'IP addresses, logs', 'US/Global'],
                      ['Render (render.com)', 'API hosting', 'IP addresses, logs', 'US'],
                      ['Cloudinary (cloudinary.com)', 'Image storage', 'Image files only', 'US/Global'],
                      ['Resend (resend.com)', 'Transactional email', 'Name, email, order details', 'US'],
                    ].map(([provider, purpose, data, location]) => (
                      <tr key={provider} className="border-b border-primary/20">
                        <td className="px-3 py-2 align-top" style={{ color: '#F2EAD8' }}>{provider}</td>
                        <td className="px-3 py-2 align-top" style={{ color: '#8C7355' }}>{purpose}</td>
                        <td className="px-3 py-2 align-top" style={{ color: '#8C7355' }}>{data}</td>
                        <td className="px-3 py-2 align-top" style={{ color: '#8C7355' }}>{location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Your Rights">
              <p style={{ color: '#8C7355' }}>
                Under the DPPA you may request access, correction, objection, deletion, or lodge a complaint with the PDPO.
                Email <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>haiqafrica@gmail.com</a> with subject "Data Rights Request". We respond within 14 working days.
              </p>
            </Section>

            <Section title="Security Measures">
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: '#8C7355' }}>
                <li>Passwords hashed with bcrypt (cost 12); tokens in secure HTTP-only cookies.</li>
                <li>All API traffic over HTTPS; rate limiting and input validation on all endpoints.</li>
                <li>Parameterised SQL queries and short-lived access tokens with refresh rotation.</li>
                <li>Admin access separated with elevated privilege for superadmin actions.</li>
              </ul>
            </Section>

            <Section title="Data Breach Notification">
              <p style={{ color: '#8C7355' }}>
                In a personal data breach we will notify affected users within 72 hours and inform the PDPO where required. We will contain the breach,
                document the incident, and prevent recurrence. If you suspect compromise, contact us immediately or reset your password via /forgot-password.
              </p>
            </Section>

            <Section title="Cross-Border Data Transfers">
              <p style={{ color: '#8C7355' }}>
                HAIQ data is hosted in the United States. By using our platform you consent to this transfer. Our providers maintain security standards consistent
                with international best practice.
              </p>
            </Section>

            <Section title="Contact and Regulatory Information">
              <p style={{ color: '#8C7355' }}>
                Data Controller: HAIQ, Muyenga, Kampala, Uganda · Email: <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>haiqafrica@gmail.com</a>
              </p>
              <p style={{ color: '#8C7355' }}>
                Regulatory Authority: Personal Data Protection Office (PDPO), NITA-Uganda, Palm Courts, Plot 7A Rotary Avenue, Kololo, Kampala.
              </p>
            </Section>

            <Section title="Updates to This Page">
              <p style={{ color: '#8C7355' }}>
                This page is updated whenever our data practices change. Current version: haiqweb.vercel.app/data-compliance.
                Material changes will be announced on the platform.
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
      <div className="space-y-2 leading-relaxed" style={{ color: '#F2EAD8' }}>
        {children}
      </div>
    </section>
  )
}
