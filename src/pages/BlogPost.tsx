
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ArtigoProps {
  id: string;
  titulo: string;
  resumo: string;
  autor: string;
  data: string;
  imagem: string;
  categoria: string;
  tempoDeLeitura: string;
  conteudo?: string;
}

// Lista de artigos com conteúdo completo
const artigos: ArtigoProps[] = [
  {
    id: "1",
    titulo: "Como iniciar sua própria horta orgânica urbana",
    resumo: "Dicas práticas para começar a cultivar alimentos orgânicos em espaços pequenos.",
    autor: "Ana Silva",
    data: "12 de Março, 2025",
    imagem: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
    categoria: "Jardinagem Urbana",
    tempoDeLeitura: "8 min",
    conteudo: `
      <h2>Como Começar sua Horta Urbana</h2>
      <p>Ter uma horta em casa é mais simples do que parece! Veja os passos:</p>
      
      <h3>1. Escolha do Local</h3>
      <p>Procure um espaço com:</p>
      <ul>
        <li>Boa iluminação (mínimo 4 horas de sol)</li>
        <li>Proteção contra vento forte</li>
        <li>Fácil acesso para manutenção</li>
      </ul>
      
      <h3>2. Materiais Necessários</h3>
      <ul>
        <li>Vasos ou canteiros</li>
        <li>Terra adubada</li>
        <li>Sementes ou mudas</li>
        <li>Ferramentas básicas</li>
      </ul>
      
      <h3>3. Primeiras Plantações</h3>
      <p>Comece com plantas fáceis:</p>
      <ul>
        <li>Temperos: manjericão, cebolinha, salsa</li>
        <li>Hortaliças: alface, rúcula, couve</li>
        <li>Legumes: tomate-cereja, pimentão</li>
      </ul>
    `
  },
  // ... outros artigos continuam aqui
];

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [artigo, setArtigo] = useState<ArtigoProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const found = artigos.find(a => a.id === id);
    setArtigo(found || null);
    setIsLoading(false);
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4">Carregando artigo...</p>
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <div className="container px-4 py-8">
          <Link to="/blog" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para o Blog</span>
          </Link>
          
          <Alert variant="destructive" className="mt-8">
            <AlertTitle>Artigo não encontrado</AlertTitle>
            <AlertDescription>
              O artigo que você está procurando não existe ou foi removido.
            </AlertDescription>
          </Alert>
          
          <Button variant="default" className="mt-6 bg-eco-green hover:bg-eco-green-dark" asChild>
            <Link to="/blog">Voltar para o Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o Blog</span>
        </Link>
        
        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative h-64 md:h-96">
            <img 
              src={artigo.imagem} 
              alt={artigo.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-eco-green text-white text-sm font-medium px-3 py-1 rounded">
              {artigo.categoria}
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {artigo.titulo}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span>{artigo.data}</span>
              <span>Por {artigo.autor}</span>
              <span>{artigo.tempoDeLeitura} de leitura</span>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: artigo.conteudo || '' }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
