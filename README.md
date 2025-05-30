#🌱 Ecologia
## EcoCity - Mapeamento Sustentável de Resíduos

**URL**: https://test-green-iota-34.vercel.app/

Bem-vindo ao EcoCity, um projeto web inovador que conecta pessoas a pontos de coleta de lixo eletrônico, lâmpadas e materiais recicláveis em suas cidades. Nosso objetivo é promover a sustentabilidade e facilitar o descarte correto, reduzindo impactos ambientais

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/gualvesx/EcoCity.git

# Step 2: Navigate to the project directory.
cd EcoCity

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/eca389c4-ae91-4d03-b97c-0b1d4a7494cc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvuILIDo5uxxkX4SRo1rkMGN3EVKf_cRQ",
  authDomain: "ecocity-801cc.firebaseapp.com",
  projectId: "ecocity-801cc",
  storageBucket: "ecocity-801cc.firebasestorage.app",
  messagingSenderId: "825751292076",
  appId: "1:825751292076:web:11dcde0f9a5d153b64b709",
  measurementId: "G-9NQK92Q42X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

--

npm install firebase
npm install -g firebase-tools

É possível implantar agora ou depois. Para implantar agora, abra uma janela de terminal e navegue ou crie um diretório raiz a partir do seu app da Web.

Faça login no Google
firebase login
Iniciar seu projeto
Execute este comando do diretório raiz do seu app:

firebase init
Quando tudo estiver pronto, implante seu app da Web
Inclua seus arquivos estáticos (por exemplo, HTML, CSS, JS) no diretório de implantação do app (o padrão é "público"). Em seguida, execute este comando no diretório raiz dele:

firebase deploy


relatorio:
uma maneira de, ao interagir com um ponto no mapa (ou em uma lista associada), acionar a remoção dele tanto visualmente quanto no seu banco de dados Firestore. Isso é super comum e totalmente possível!
Vamos criar um exemplo básico em React, usando TypeScript, mostrando como você gerenciaria a lista de pontos no estado do componente e implementaria uma função para remover um ponto específico, chamando o Firestore para a remoção persistente.
Lembre-se que este é um exemplo simplificado. A parte de "renderizar o mapa" e "clicar em um ponto no mapa" seria feita usando uma biblioteca de mapas (como Leaflet, Google Maps API para React, React Map GL, etc.). Aqui, vamos focar na lógica React para gerenciar a lista de pontos e a interação com o Firestore.
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app'; // Importe o core do Firebase
import 'firebase/compat/firestore'; // Importe o Firestore

// Assumindo que você já inicializou o Firebase em algum lugar da sua aplicação
// import './firebase-config'; // Ex: arquivo onde você chama firebase.initializeApp({...})

// Definição da interface para a estrutura de um ponto (baseado no que você forneceu)
interface PointData {
  address: string;
  description: string;
  id: string; // É crucial ter um ID para identificar o documento no Firestore
  impact: string;
  lat: number;
  lng: number;
  name: string;
  type: string;
}

// Componente React para exibir o mapa e gerenciar os pontos
const MapComponent: React.FC = () => {
  // Estado para armazenar a lista de pontos que serão exibidos no mapa
  const [mapPoints, setMapPoints] = useState<PointData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para carregar os pontos do Firestore quando o componente montar
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const snapshot = await firebase.firestore().collection('points').get();
        const pointsList: PointData[] = snapshot.docs.map(doc => ({
          id: doc.id, // Use o ID do documento do Firestore como o ID do ponto
          ...(doc.data() as Omit<PointData, 'id'>) // Pega o resto dos dados do documento
        }));
        setMapPoints(pointsList);
      } catch (err: any) {
        console.error("Erro ao carregar pontos:", err);
        setError("Não foi possível carregar os pontos.");
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();

    // TODO: Adicionar um listener em tempo real se necessário,
    // usando onSnapshot ao invés de get()
    // Exemplo:
    // const unsubscribe = firebase.firestore().collection('points').onSnapshot(snapshot => { ... });
    // return () => unsubscribe(); // Limpar o listener na desmontagem do componente

  }, []); // Array de dependências vazio significa que roda apenas uma vez na montagem

  // Função assíncrona para remover um ponto pelo seu ID
  const handleRemovePoint = async (pointId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este ponto?")) {
      return; // Cancela a remoção se o usuário não confirmar
    }

    try {
      // 1. Remover o ponto do Firestore (persistência)
      // Certifique-se de que sua regra de segurança do Firestore permite deletes para usuários autenticados, por exemplo:
      // allow delete: if request.auth != null;
      await firebase.firestore().collection('points').doc(pointId).delete();
      console.log(`Ponto com ID ${pointId} removido do Firestore.`);

      // 2. Remover o ponto do estado local (atualização da UI)
      // Criamos uma nova lista que exclui o ponto removido
      setMapPoints(prevPoints => prevPoints.filter(point => point.id !== pointId));
      console.log(`Ponto com ID ${pointId} removido do estado local.`);

    } catch (err: any) {
      console.error(`Erro ao remover ponto com ID ${pointId}:`, err);
      // Opcional: Mostrar uma mensagem de erro para o usuário
      alert("Erro ao remover o ponto. Tente novamente.");
      // Opcional: Se a remoção do Firestore falhou, você pode querer re-adicionar o ponto ao estado local
      // ou recarregar os dados, dependendo da complexidade e UX desejada.
    }
  };

  if (loading) {
    return <p>Carregando pontos...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>; // Certifique-se de ter um CSS para a classe error
  }

  return (
    <div>
      <h2>Mapa com Pontos</h2>

      {/* ESTA É A PARTE QUE VOCÊ SUBSTITUIRIA PELA SUA BIBLIOTECA DE MAPAS */}
      {/* O CÓDIGO ABAIXO É APENAS UM PLACEHOLDER ILUSTRANDO COMO PASSAR OS PONTOS E A FUNÇÃO DE REMOÇÃO */}
      <div style={{ border: '1px solid black', height: '500px', width: '100%' }}>
        {/* Aqui estaria a renderização do seu mapa */}
        <p>Componente do Mapa Aqui (ex: LeafletMap, GoogleMap, etc.)</p>
        <p>Pontos Carregados: {mapPoints.length}</p>

        {/* Exemplo de como você passaria os pontos e a função de remoção para o componente do mapa */}
        {/* Imagine que seu componente de mapa recebe uma prop `points` e uma prop `onPointRemove` */}
        {/* <YourMapLibraryComponent
          points={mapPoints}
          onPointRemove={handleRemovePoint} // Passa a função para o componente do mapa
        /> */}

        {/* Ou, se você tiver uma lista de pontos ao lado do mapa: */}
        <h3>Lista de Pontos (Exemplo de Interação)</h3>
        <ul>
          {mapPoints.map(point => (
            <li key={point.id}>
              {point.name} ({point.lat}, {point.lng})
              {/* Botão para acionar a remoção */}
              <button onClick={() => handleRemovePoint(point.id)} style={{ marginLeft: '10px', color: 'red' }}>
                Remover
              </button>
            </li>
          ))}
           {mapPoints.length === 0 && <p>Nenhum ponto encontrado.</p>}
        </ul>

      </div>
      {/* FIM DA PARTE DO PLACEHOLDER */}
    </div>
  );
};

export default MapComponent;
Explicação do Código:
Importações: Importamos React, os hooks useState e useEffect , e as partes do Firebase que vamos usar ( firebase/compat/app e firebase/compat/firestore ). Usamos as versões compat para simplificar neste exemplo, mas em projetos novos, prefira as importações modulares ( import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; ).
Interface PointData : Reafirmamos a estrutura esperada para um ponto, incluindo o id que será o doc.id do Firestore.
Estado mapPoints : Um array ( PointData[] ) no estado do componente que guarda a lista de pontos a serem mostrados. Quando essa lista muda, o React re-renderiza o componente (e consequentemente, o mapa, se ele usar essa lista).
useEffect para Carregar Dados: Usamos useEffect para buscar os pontos da coleção points no Firestore quando o componente é montado. O snapshot.docs.map itera sobre os documentos retornados e os transforma em objetos PointData , usando o doc.id e os dados do documento ( doc.data() ).
handleRemovePoint Função:
Esta função é assíncrona porque interage com o Firestore.
Ela recebe o pointId do ponto a ser removido.
Inclui uma confirmação simples antes de prosseguir.
Dentro do try...catch :
firebase.firestore().collection('points').doc(pointId).delete() : Esta é a chamada crucial para o Firestore que remove o documento permanentemente do seu banco de dados.
setMapPoints(prevPoints => prevPoints.filter(point => point.id !== pointId)) : Se a remoção no Firestore foi bem-sucedida, atualizamos o estado local mapPoints . Usamos o método filter para criar uma nova array que contém todos os pontos exceto aquele cujo id corresponde ao pointId . É importante criar uma nova array ( .filter faz isso) e não modificar a array original do estado diretamente.
O bloco catch lida com possíveis erros durante a comunicação com o Firestore (ex: problemas de permissão, rede).
Renderização ( return ) :
Mostra um placeholder para a área do mapa.
Inclui um exemplo simples de uma lista ( <ul> ) mostrando os nomes dos pontos e um botão "Remover" ao lado de cada um.
O onClick do botão chama handleRemovePoint , passando o point.id específico daquele item da lista. Este é o gatilho para a remoção.
Como adaptar para o Mapa Real:
No lugar do placeholder:
<div style={{ border: '1px solid black', height: '500px', width: '100%' }}>
  {/* Sua lógica de renderização do mapa aqui */}
  {/* Se você estiver usando uma biblioteca de mapas, ela provavelmente terá um componente */}
  {/* para marcadores (markers). Você passaria a lista `mapPoints` para ela. */}

  {/* Por exemplo, se usasse uma lib hipotética: */}
  {/* <MapLibComponent center={[ -23.55, -46.63 ]


Este é um projeto proprietário. Todos os direitos sobre este código são reservados a EcoCity 

Nenhuma parte deste código pode ser usada, modificada ou distribuída sem autorização expressa por escrito do detentor dos direitos autorais.

Para informações sobre licenciamento e permissões de uso, entre em contato em ecocity.gg@gmail.com.
