
import { HeroSection } from '@/components/about/HeroSection';
import { TeamSection } from '@/components/about/TeamSection';
import { MapDataSection } from '@/components/about/MapDataSection';
import { TimelineSection } from '@/components/about/TimelineSection';
import { ContactSection } from '@/components/about/ContactSection';
import { MessageCarousel } from '@/components/about/MessageCarousel';

const About = () => {
  const ecoCityMessages = [
    "Compromisso com a sustentabilidade é o nosso maior valor. Juntos podemos criar um futuro mais verde para Presidente Prudente.",
    "Acreditamos que pequenas ações locais podem gerar um grande impacto global. Cada ponto no mapa representa uma mudança positiva.",
    "Nossa visão é construir uma cidade onde humanos e natureza vivam em harmonia, promovendo práticas sustentáveis no dia a dia.",
    "Trabalhamos para inspirar as próximas gerações, mostrando que tecnologia e ecologia podem caminhar juntas.",
    "EcoCity: Conectando pessoas que se importam com o meio ambiente e querem fazer a diferença em sua comunidade."
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <HeroSection />
        
        <MessageCarousel messages={ecoCityMessages} />
        
        <TeamSection />
        
        <MapDataSection />
        <TimelineSection />
        <ContactSection />
      </div>
    </div>
  );
};

export default About;
