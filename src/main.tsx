import { AuthProvider } from '@/lib/auth/authprovider';
import { keycloak } from '@/lib/auth/keycloak';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './tailwind.css';

async function bootstrap() {
  const isAuth = await keycloak.init({
    pkceMethod: 'S256',
    onLoad: 'login-required',
    checkLoginIframe: false,
    flow: 'standard',
    redirectUri: `${window.location.origin}/my/dashboard`,
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider bootAuthenticated={isAuth}>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}

bootstrap();
