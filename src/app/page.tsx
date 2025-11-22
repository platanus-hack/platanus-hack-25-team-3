import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { UploadButton } from '@/components/upload-button';

const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
    title: 'Excelentes Historias',
    description:
      'Sumérgete en cuentos fascinantes que despiertan la imaginación y enseñan valores con cada aventura.',
    bgColor: 'bg-red-400',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 14.5c-3 0-5.5 2.5-5.5 5.5S7 25.5 10 25.5 15.5 23 15.5 20s-2.5-5.5-5.5-5.5z" />
        <path d="M10 2c-3 0-5.5 2.5-5.5 5.5S7 13 10 13s5.5-2.5 5.5-5.5S13 2 10 2z" />
        <path d="M18.5 10c0-3 2.5-5.5 5.5-5.5S29.5 7 29.5 10s-2.5 5.5-5.5 5.5-5.5-2.5-5.5-5.5z" />
        <path d="M14 18.5c-3 0-5.5 2.5-5.5 5.5S11 29.5 14 29.5s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z" />
      </svg>
    ),
    title: 'Nuevos Mundos',
    description:
      'Explora reinos mágicos, planetas lejanos y bosques encantados. ¡Cada cuento es un portal a un lugar increíble!',
    bgColor: 'bg-blue-400',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 16.5c-2.5-1-4.8-1-7 0" />
        <path d="M19 12c-3.1 0-5.7 1.3-7.5 3.5" />
        <path d="M18 7c-4 0-7.3 2-9.5 5" />
        <path d="M15 5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1" />
      </svg>
    ),
    title: 'Nuevos Personajes',
    description:
      'Hazte amigo de valientes héroes, criaturas fantásticas y sabios magos. ¡Te esperan compañeros inolvidables!',
    bgColor: 'bg-green-400',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18.5 7.4a1 1 0 0 1 1.5 1.1l-3 6.1a1 1 0 0 1-1.4.1l-3-2.1a1 1 0 0 1-.1-1.4l3-4.1a1 1 0 0 1 1.5-.2z" />
        <path d="M12 17.5a1 1 0 0 0-1.5-1.1l-3-2.1a1 1 0 0 0-1.4.1l-3 6.1a1 1 0 0 0 1.5 1.1l3-2.1a1 1 0 0 0 .1-1.4z" />
        <path d="M22 17h-7" />
      </svg>
    ),
    title: 'Juegos Dinámicos',
    description:
      'No solo leas, ¡participa! Interactúa con las historias y forma parte de la magia de una manera divertida.',
    bgColor: 'bg-yellow-400',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'kiddie-hero');

  return (
    <div className="flex flex-col items-center">
      <section
        className="w-full bg-white relative"
        style={{
          backgroundImage: "url('/lined-paper-bg.png')",
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center py-12 md:py-24 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 font-headline">
              ¡Bienvenido a Kippu Tales!
            </h1>
            <p className="text-4xl md:text-6xl font-extrabold text-primary mt-2 font-headline">
              Juega, aprende
              <br />
              y crece juntos.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold text-lg px-8 py-6"
            >
              <Link href="/library">Comenzar Aventura</Link>
            </Button>
          </div>
          <div className="relative h-64 md:h-96">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-contain"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 font-headline">
            ¿Por qué nos prefieren?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center p-4">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${feature.bgColor} shadow-lg mb-4 transform transition-transform hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2 text-gray-700 font-headline">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <UploadButton />
    </div>
  );
}
