import MovieSpotlight from '../components/MovieSpotlight'
import TrendingSection from '../components/TrendingSection'
import CommunityReviews from '../components/CommunityReviews'
import AboutSection from '../components/AboutSection'
import CategoriesSection from '../components/CategoriesSection'

const HomePage = () => {
  return (
    <>
      <MovieSpotlight />
      <CommunityReviews />
      <AboutSection />
      <CategoriesSection />
    </>
  )
}

export default HomePage
