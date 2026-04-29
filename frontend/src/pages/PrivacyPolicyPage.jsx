import { useState, useEffect } from 'react'
import SEO from '../components/shared/SEO'

export default function PrivacyPolicyPage() {
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/privacy-policy-content.html')
      .then(res => res.text())
      .then(html => {
        // Update colors to match HAIQ theme
        const themedHtml = html
          .replace(/color:\s*#000000/g, 'color: #F2EAD8')
          .replace(/color:\s*#595959/g, 'color: #8C7355')
          .replace(/color:\s*rgb\(0,\s*58,\s*250\)/g, 'color: #B8752A')
          .replace(/color:\s*rgb\(48,\s*48,\s*241\)/g, 'color: #B8752A')
        setHtmlContent(themedHtml)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load privacy policy:', err)
        setLoading(false)
      })
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
          
          {loading ? (
            <p style={{ color: '#8C7355' }}>Loading...</p>
          ) : htmlContent ? (
            <div 
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              style={{ color: '#F2EAD8', lineHeight: '1.6' }}
            />
          ) : (
            <p style={{ color: '#8C7355' }}>Failed to load privacy policy content.</p>
          )}

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
