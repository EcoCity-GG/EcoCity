
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Settings, Shield, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define cookie preferences type
interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  // State for banner visibility and detailed settings dialog
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    preferences: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentData = localStorage.getItem('cookie_consent');
    
    if (!consentData) {
      // If no consent data, show the banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // If consent data exists, parse and apply stored preferences
      try {
        const savedPreferences = JSON.parse(consentData);
        setPreferences(savedPreferences);
        
        // Apply consent to analytics
        if (savedPreferences.analytics) {
          enableAnalytics();
        }
      } catch (error) {
        console.error('Error parsing cookie consent data:', error);
        setShowBanner(true);
      }
    }
  }, []);

  // Handle accepting all cookies
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true
    };
    
    saveConsent(allAccepted);
  };

  // Handle accepting only necessary cookies
  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false
    };
    
    saveConsent(necessaryOnly);
  };

  // Save consent to localStorage and apply preferences
  const saveConsent = (consentPreferences: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(consentPreferences));
    setPreferences(consentPreferences);
    
    // Apply analytics consent
    if (consentPreferences.analytics) {
      enableAnalytics();
    }
    
    // Close UI elements
    setShowBanner(false);
    setShowSettings(false);
  };

  // Apply current preferences and close settings
  const applyPreferences = () => {
    saveConsent(preferences);
  };

  // Enable Firebase Analytics
  const enableAnalytics = () => {
    // This is where we would initialize analytics if the user consented
    // Implementation depends on the analytics setup in your Firebase config
    console.log('Analytics enabled based on user consent');
  };

  // Toggle individual preference
  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot toggle necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      {/* Main Cookie Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-eco-green-light p-4 z-50">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-eco-green" />
                  Política de Cookies e Privacidade
                </h3>
                <p className="text-sm text-muted-foreground my-2">
                  Este site utiliza cookies para melhorar sua experiência. Clique em "Aceitar todos" para consentir com o uso de todos os cookies ou "Personalizar" para escolher suas preferências.
                </p>
                <Link to="/privacy-policy" className="text-sm text-eco-green hover:underline">
                  Saiba mais na nossa Política de Privacidade
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Personalizar
                </Button>
                <Button variant="outline" onClick={acceptNecessary}>
                  Apenas necessários
                </Button>
                <Button className="bg-eco-green hover:bg-eco-green-dark" onClick={acceptAll}>
                  Aceitar todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-eco-green" />
              Configurações de Cookies
            </DialogTitle>
            <DialogDescription>
              Personalize suas preferências de privacidade. Você pode alterar essas configurações a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="cookies" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cookies">Cookies</TabsTrigger>
              <TabsTrigger value="info">Informações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cookies" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookies necessários</h4>
                    <p className="text-sm text-muted-foreground">
                      Essenciais para o funcionamento do site.
                    </p>
                  </div>
                  <Switch checked={preferences.necessary} disabled />
                </div>
                <Separator />

                {/* Preference Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookies de preferências</h4>
                    <p className="text-sm text-muted-foreground">
                      Permitem que o site lembre suas preferências.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.preferences}
                    onCheckedChange={() => togglePreference('preferences')}
                    id="preferences-cookies"
                  />
                </div>
                <Separator />

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookies analíticos</h4>
                    <p className="text-sm text-muted-foreground">
                      Ajudam a entender como você usa o site.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={() => togglePreference('analytics')}
                    id="analytics-cookies"
                  />
                </div>
                <Separator />

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookies de marketing</h4>
                    <p className="text-sm text-muted-foreground">
                      Usados para personalizar anúncios.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={() => togglePreference('marketing')}
                    id="marketing-cookies"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    O que são cookies?
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Cookies são pequenos arquivos de texto armazenados no seu navegador que permitem 
                    que o site lembre suas preferências e otimize sua experiência.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Como protegemos seus dados?
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Seguimos as diretrizes da LGPD (Lei Geral de Proteção de Dados) para garantir que seus 
                    dados pessoais estejam seguros e sejam utilizados apenas para os fins informados.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Como gerenciar suas preferências?
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Você pode alterar suas preferências de cookies a qualquer momento através 
                    do link "Configurações de Cookies" no rodapé do site.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={acceptNecessary}>
                Apenas necessários
              </Button>
              <Button variant="default" className="bg-eco-green hover:bg-eco-green-dark" onClick={applyPreferences}>
                Salvar preferências
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Settings Link - Always visible */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="fixed bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 shadow-sm z-40 text-xs" 
        onClick={() => setShowSettings(true)}
      >
        <Settings className="w-3 h-3 mr-1" />
        Configurações de Cookies
      </Button>
    </>
  );
}
