import { Highlighter } from "../components/ui/highlighter"
import { useNavigate } from "react-router-dom"
const Hero = () => {
  const navigate = useNavigate()
  return (
          <div className='flex flex-col items-center justify-center h-screen bg-black text-white space-y-6 text-center px-4' style={{backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(88, 28, 135, 0.8), transparent 70%)'}}>
        <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] max-w-2xl'>
        You bring the clips
        <br />
        We bring the curse
      </h1>
      <p className='max-w-2xl text-lg text-zinc-300 leading-relaxed'>
        Edit like a pro without touching a timeline. <Highlighter action="underline">We handle the heavy lifting, you take the credit.</Highlighter>
      </p>
<button onClick={() => navigate('/editor')} className='mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md transition-colors'>
          Get started
</button>
    </div>
  )
}

export default Hero