import { HomeSEO } from '../components/shared/SEO'
import HeroSection          from '../components/home/HeroSection'
import FeaturedCollections  from '../components/home/FeaturedCollections'
import ProcessSection       from '../components/home/ProcessSection'
import CoreCollectionCarousel from '../components/home/CoreCollectionCarousel'
import MomentsSection       from '../components/home/MomentsSection'
import BrandStory           from '../components/home/BrandStory'
import CTASection           from '../components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <HomeSEO />
      <HeroSection />
      <FeaturedCollections />
      <ProcessSection />
      <CoreCollectionCarousel />
      <MomentsSection />
      <BrandStory />
      <CTASection />
    </>
  )
}
