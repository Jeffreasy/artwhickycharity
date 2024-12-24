import ArtheroTekst from './components/ArtheroTekst/Artherotekst'
import { Fotocarrousel1 } from './components/Fotocarrousel/fotocarrousel1/fotocarrousel1'
import Fotocarrousel2 from './components/Fotocarrousel/fotocarrousel2/fotocarrousel2'
import { Fotocarrousel3 } from './components/Fotocarrousel/fotocarrousel3/fotocarrousel3'
import VideoSection from './components/Videosection/videosection'

export default function ArtPage() {
  return (
    <main>
      <ArtheroTekst />
      <Fotocarrousel1 />
      <Fotocarrousel2 />
      <Fotocarrousel3 />
      <VideoSection />
    </main>
  )
}
