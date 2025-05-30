
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from 'sonner';
import Index from '@/pages/Index';
import About from '@/pages/About';
import MapaEcologico from '@/pages/EcologicalMap';
import MapSummary from '@/pages/MapSummary';
import Events from '@/pages/Events';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Layout from '@/components/Layout';
import AdminPanel from '@/pages/AdminPanel';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminMapRequests from '@/pages/AdminMapRequests';
import MyMapRequests from '@/pages/MyMapRequests';
import UserProfile from '@/pages/UserProfile';
import MapaTelaCheia from '@/pages/MapaTelaCheia';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReCaptchaProvider } from '@/contexts/ReCaptchaContext';
import ScrollToTop from '@/components/ScrollToTop';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import AuthGuard from '@/components/AuthGuard';
import CookieConsent from '@/components/CookieConsent';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <ReCaptchaProvider>
            <Router>
              <ScrollToTop />
              <ProfileCompletionModal />
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/map" element={
                    <AuthGuard requireVerification={true}>
                      <MapaEcologico />
                    </AuthGuard>
                  } />
                  <Route path="/map-summary" element={<MapSummary />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/admin-panel" element={
                    <AuthGuard requireVerification={true}>
                      <AdminPanel />
                    </AuthGuard>
                  } />
                  <Route path="/admin-dashboard" element={
                    <AuthGuard requireVerification={true}>
                      <AdminDashboard />
                    </AuthGuard>
                  } />
                  <Route path="/admin-map-requests" element={
                    <AuthGuard requireVerification={true}>
                      <AdminMapRequests />
                    </AuthGuard>
                  } />
                  <Route path="/my-map-requests" element={
                    <AuthGuard requireVerification={true}>
                      <MyMapRequests />
                    </AuthGuard>
                  } />
                  <Route path="/profile" element={
                    <AuthGuard requireVerification={false}>
                      <UserProfile />
                    </AuthGuard>
                  } />
                  {/* Adicionando as rotas para o mapa em tela cheia */}
                  <Route path="/mapatelacheia" element={
                    <AuthGuard requireVerification={true}>
                      <MapaTelaCheia />
                    </AuthGuard>
                  } />
                  {/* Rota alternativa com primeira letra maiúscula para garantir compatibilidade */}
                  <Route path="/MapaTelaCheia" element={
                    <AuthGuard requireVerification={true}>
                      <MapaTelaCheia />
                    </AuthGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              <CookieConsent />
              <SonnerToaster 
                richColors 
                position="top-right" 
                closeButton={true}
                duration={10000} 
              />
              <Toaster />
            </Router>
          </ReCaptchaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
