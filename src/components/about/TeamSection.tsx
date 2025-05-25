
import { User, Github, Code, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const teamMembers = [
  {
    name: 'Gustavo Alves',
    role: 'Diretor',
    description: 'Criador do projeto, desenvolvedor em aprendizagem, 17 anos e entusiasta da Ecologia.',
    skills: ['React', 'Firebase', 'UX/UI']
  },
  {
    name: 'Gabriel Gedolin',
    role: 'Coordenador',
    description: 'Desenvolvedor aprendiz, 17 anos, apoiador do projeto EcoCity e apoiador da Ecologia.',
    skills: ['JavaScript', 'Tailwind', 'Design']
  }
];

export const TeamSection = () => {
  const { t } = useLanguage();
  
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-eco-green-dark mb-4 text-center">
        Nossa Equipe
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Jovens desenvolvedores comprometidos com a ecologia e a tecnologia, 
        trabalhando para criar um futuro sustentável para Presidente Prudente.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {teamMembers.map((member) => (
          <Card key={member.name} className="overflow-hidden border-2 border-eco-green-light/30 shadow-lg">
            <CardHeader className="bg-eco-green-light/20 pb-0">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-eco-green-light/40 flex items-center justify-center">
                  <User size={50} className="text-eco-green-dark" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-eco-green-dark font-medium">{member.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-base mb-4">{member.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {member.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-eco-green-light/10">
                    <Code size={14} className="mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-eco-green-light/10 p-6 rounded-lg border border-eco-green-light/20">
        <div className="flex items-start gap-4">
          <Leaf size={40} className="text-eco-green-dark mt-1" />
          <div>
            <h3 className="text-xl font-bold text-eco-green-dark mb-2">Origem do Projeto</h3>
            <p className="text-base mb-3">
              O projeto EcoCity nasceu em Presidente Prudente, São Paulo, durante um curso de desenvolvimento no SENAI.
              Inspirado pela necessidade de unir tecnologia e sustentabilidade, nosso objetivo é criar uma plataforma que
              promova a consciência ecológica e ações sustentáveis em nossa comunidade.
            </p>
            <p className="text-base">
              Desenvolvido com tecnologias modernas como React, Firebase e Tailwind CSS, o EcoCity representa não apenas
              um projeto de software, mas um movimento em prol da ecologia e do desenvolvimento sustentável em Presidente Prudente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
