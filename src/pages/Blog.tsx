import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArtigoProps {
  id: string;
  titulo: string;
  resumo: string;
  autor: string;
  data: string;
  imagem: string;
  categoria: string;
  tempoDeLeitura: string;
}

const artigos: ArtigoProps[] = [
  {
    id: "1",
    titulo: "Como iniciar sua própria horta orgânica urbana",
    resumo: "Dicas práticas para começar a cultivar alimentos orgânicos em espaços pequenos, mesmo em apartamentos.",
    autor: "Ana Silva",
    data: "12 de Março, 2025",
    imagem: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
    categoria: "Jardinagem Urbana",
    tempoDeLeitura: "8 min"
  },
  {
    id: "2",
    titulo: "O impacto da reciclagem correta na redução da poluição",
    resumo: "Entenda como separar corretamente seus resíduos pode fazer uma grande diferença para o meio ambiente.",
    autor: "Carlos Mendes",
    data: "05 de Março, 2025",
    imagem: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    categoria: "Reciclagem",
    tempoDeLeitura: "6 min"
  },
  {
    id: "3",
    titulo: "Projetos de reflorestamento em Presidente Prudente",
    resumo: "Conheça as iniciativas locais que estão ajudando a restaurar áreas degradadas e promover a biodiversidade.",
    autor: "Marina Costa",
    data: "28 de Fevereiro, 2025",
    imagem: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    categoria: "Reflorestamento",
    tempoDeLeitura: "10 min"
  },
  {
    id: "4",
    titulo: "Maneiras criativas de reduzir o consumo de plástico",
    resumo: "Alternativas simples e acessíveis para diminuir seu uso de plásticos descartáveis no dia a dia.",
    autor: "Pedro Alves",
    data: "15 de Fevereiro, 2025",
    imagem: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
    categoria: "Consumo Consciente",
    tempoDeLeitura: "7 min"
  },
  {
    id: "5",
    titulo: "Arquitetura sustentável: tendências para 2025",
    resumo: "Como os novos projetos arquitetônicos estão incorporando princípios de sustentabilidade e eficiência energética.",
    autor: "Juliana Rocha",
    data: "02 de Fevereiro, 2025",
    imagem: "https://images.unsplash.com/photo-1527576539890-dfa815648363",
    categoria: "Arquitetura Verde",
    tempoDeLeitura: "9 min"
  }
];

const ArtigoBlog = ({ artigo }: { artigo: ArtigoProps }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={artigo.imagem} 
          alt={artigo.titulo} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-eco-green text-white text-xs font-medium px-2 py-1 rounded">
          {artigo.categoria}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{artigo.data}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            <span>{artigo.autor}</span>
          </div>
          <div className="ml-auto text-xs bg-eco-sand/50 px-2 py-0.5 rounded">
            {artigo.tempoDeLeitura} {t('min-read')}
          </div>
        </div>
        
        <h3 className="font-bold text-xl mb-2 text-eco-green-dark hover:text-eco-green transition-colors">
          {artigo.titulo}
        </h3>
        
        <p className="text-muted-foreground mb-4">
          {artigo.resumo}
        </p>
        
        <button
          onClick={() => navigate(`/blog/${artigo.id}`)}
          className="inline-flex items-center gap-1 text-eco-green font-medium hover:text-eco-green-dark transition-colors"
        >
          <span>{t('read-more')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const Blog = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao início</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-eco-green-dark">Blog Ecológico</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Artigos, dicas e notícias sobre sustentabilidade e meio ambiente
          </p>
        </div>
        
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-eco-green-dark">Artigos em Destaque</h2>
            <div className="flex gap-2">
              <Link 
                to="/blog" 
                className="px-4 py-2 rounded-md bg-eco-green-light/20 text-eco-green-dark font-medium text-sm hover:bg-eco-green-light/30 transition-colors"
              >
                Todos
              </Link>
              <Link 
                to="/blog?categoria=reciclagem" 
                className="px-4 py-2 rounded-md text-muted-foreground text-sm hover:bg-eco-sand/30 transition-colors"
              >
                Reciclagem
              </Link>
              <Link 
                to="/blog?categoria=reflorestamento" 
                className="px-4 py-2 rounded-md text-muted-foreground text-sm hover:bg-eco-sand/30 transition-colors"
              >
                Reflorestamento
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artigos.slice(0, 3).map((artigo) => (
              <ArtigoBlog key={artigo.id} artigo={artigo} />
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-eco-green-dark mb-6">Artigos Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artigos.slice(3).map((artigo) => (
              <ArtigoBlog key={artigo.id} artigo={artigo} />
            ))}
          </div>
        </div>
        
        <div className="bg-eco-green rounded-xl shadow-md overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Newsletter
              </h2>
              <p className="text-white/80 mb-6">
                Receba as últimas notícias e atualizações sobre ecologia e sustentabilidade
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="px-4 py-3 rounded-md w-full sm:flex-1 text-foreground focus:outline-none"
                />
                <button type="submit" className="bg-eco-leaf text-eco-green-dark px-6 py-3 rounded-md font-medium hover:bg-eco-leaf/90 transition-colors">
                  Inscrever-se
                </button>
              </form>
            </div>
            <div className="hidden lg:block bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
