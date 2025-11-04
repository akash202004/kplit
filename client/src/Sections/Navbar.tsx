const Navbar = () => {
  return (
    <nav className='fixed top-0 left-0 right-0 z-50
                    bg-black/30 text-white backdrop-blur-md
                    shadow-lg'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        
        {/* Logo */}
        <div className='text-2xl font-bold'>
          Video<span className='text-purple-400'>Curse</span>
        </div>

        {/* Navigation Links */}
        <ul className='hidden md:flex items-center space-x-6'>
          <li><a href="#" className='hover:text-purple-300 transition-colors'>Projects</a></li>
          <li><a href="#" className='hover:text-purple-300 transition-colors'>AI Tools</a></li>
          <li><a href="#" className='hover:text-purple-300 transition-colors'>Templates</a></li>
          <li><a href="#" className='hover:text-purple-300 transition-colors'>Pricing</a></li>
        </ul>

        {/* Action Button */}
        <div>
          <button className='bg-purple-600 hover:bg-purple-700 text-white
                           py-2 px-4 rounded-md transition-colors'>
            Contact Us
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar