import { HomeSEO } from '../components/shared/SEO'
import HeroSection          from '../components/home/HeroSection'
import CoreCollection       from '../components/home/CoreCollection'
import BuildYourBoxStrip    from '../components/home/BuildYourBoxStrip'
import ProcessSection       from '../components/home/ProcessSection'
import MomentsSection       from '../components/home/MomentsSection'
import EventsSection        from '../components/home/EventsSection'
import BrandStory           from '../components/home/BrandStory'
import CTASection           from '../components/home/CTASection'

// Section order per the phase 2 home-page restructure: product (Core
// Collection) comes immediately after the hero — not buried below two
// more sections — so a first-time visitor sees the menu without a full
// scroll, and Build Your Box is reachable inline rather than a separate trip.
export default function HomePage() {
  return (
    <>
      <HomeSEO />
      <HeroSection />
      <CoreCollection />
      <BuildYourBoxStrip />
      <ProcessSection />
      <EventsSection />
      <MomentsSection />
      <BrandStory />
      <CTASection />
    </>
  )
}
