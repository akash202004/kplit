import { Routes, Route, useLocation } from 'react-router-dom'
import Hero from './Sections/Hero'
import Navbar from './Sections/Navbar'
import Editor from './Sections/Editor'
import BentoDemo from './Sections/FeatureBento'
import VideoCarousel from './app/components/ui/VideoCarousel'

const Home = () => (
  <div className='bg-black text-white'>
    <Hero />
    <section className='px-4 pb-16'>
      <div className='max-w-6xl mx-auto'>
        <VideoCarousel />
      </div>
    </section>
    <section className='px-4 pb-16'>
      <div className='max-w-6xl mx-auto'>
        <BentoDemo />
      </div>
    </section>
  </div>
)

const App = () => {
  const location = useLocation()
  const showNavbar = !location.pathname.startsWith('/editor')

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </div>
  )
}

export default App