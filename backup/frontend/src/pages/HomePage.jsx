import HeroSection from '../components/home/HeroSection'
import FeaturedCollections from '../components/home/FeaturedCollections'
import BrandStory from '../components/home/BrandStory'
import CoreCollectionCarousel from '../components/home/CoreCollectionCarousel'
import CTASection from '../components/home/CTASection'
import MomentsSection from '../components/home/MomentsSection'
import ProcessSection from '../components/home/ProcessSection'
import PromoBanner from '../components/layout/PromoBanner'

export default function HomePage() {
  return (
    <main>
      <PromoBanner />
      <HeroSection />
      <FeaturedCollections />
      <ProcessSection />
      <CoreCollectionCarousel />
      <MomentsSection />
      <BrandStory />
      <CTASection />
    </main>
  )
}
