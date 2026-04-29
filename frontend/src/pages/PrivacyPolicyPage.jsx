import { useEffect } from 'react'
import SEO from '../components/shared/SEO'

const TERMLY_POLICY_ID = 'eyJhbGciOiJIUzI1NiJ9.ImNXRlVHVS9DUk1wYytPaUtiQXRZZ0FINlVuMzMwblc3djhKem1sdmQ3ZkFrZkwzaDdDMGFLWDhZdnVoS0N5NTZsMU9LSTFJTW1sSUxUZEhkS1FRcitMVDlEcDZiKzZodmRNczF4ekF0djRUWUdtSGlMWFRVbWlMQzRSNk5CSW4zWVZLZG5HVFFJRzVUR3F4K3FKQXlyUT09LS0wWFVJekd2OGZwMlZUUkJOLS1OYkNTZHJ5Mkc1NEJuTUlhbklVMFNBPT0i.m0MkGiBLxgKJGx2k_vCFvNDDTn9CatxVQNQGnHDmcd8'

export default function PrivacyPolicyPage() {
  useEffect(() => {
    if (document.getElementById('termly-jssdk')) return
    const js = document.createElement('script')
    js.id = 'termly-jssdk'
    js.src = 'https://app.termly.io/embed-policy.min.js'
    document.body.appendChild(js)
  }, [])

  return (
    <>
      <SEO
        title="Privacy Policy | HAIQ"
        description="How HAIQ collects, uses, and protects your personal data."
      />
      <div style={{ background: '#1A0A00', minHeight: '80vh' }} className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#B8752A' }}>
            Legal
          </p>
          <h1 className="font-serif font-bold text-4xl mb-2" style={{ color: '#F2EAD8' }}>
            Privacy Policy
          </h1>
          <div className="w-8 h-px mb-8" style={{ background: '#B8752A' }} />
          <p className="text-sm mb-8" style={{ color: '#8C7355' }}>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div
            name="termly-embed"
            data-id={TERMLY_POLICY_ID}
            data-type="iframe"
            style={{ color: '#F2EAD8', minHeight: '400px' }}
          />

          <p className="text-sm mt-12" style={{ color: '#8C7355' }}>
            Questions about this policy? Email us at{' '}
            <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>
              haiqafrica@gmail.com
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
