import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HouseholdProvider, useHousehold } from './context/HouseholdContext';
import { LoginPage } from './routes/LoginPage';
import { HouseholdGatePage } from './routes/HouseholdGatePage';
import { BoardPage } from './routes/BoardPage';
import { SettingsPage } from './routes/SettingsPage';
import { AppShell } from './components/AppShell';
import { missingFirebaseConfig } from './firebase/config';
import './styles/app.css';

function Gate() {
  const { user, loading: authLoading } = useAuth();
  const { currentHousehold, currentHouseholdId, householdsLoading } = useHousehold();

  if (missingFirebaseConfig.length > 0) {
    return (
      <div className="config-manquante">
        <h1>Configuration Firebase incomplète</h1>
        <p>
          Il manque les variables d'environnement suivantes : <code>{missingFirebaseConfig.join(', ')}</code>.
        </p>
        <p>Copiez <code>.env.example</code> en <code>.env.local</code> et renseignez votre projet Firebase.</p>
      </div>
    );
  }

  if (authLoading) {
    return <div className="chargement">Chargement…</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (householdsLoading && currentHouseholdId) {
    return <div className="chargement">Chargement…</div>;
  }

  if (!currentHousehold) {
    return <HouseholdGatePage />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<BoardPage />} />
        <Route path="/reglages" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <Gate />
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
