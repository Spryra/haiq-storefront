import Navbar from './Navbar'
import Footer from './Footer'

// PromoBanner is now rendered INSIDE the Navbar fixed block
// so it doesn't overlap. Do not add it here.

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-light">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
