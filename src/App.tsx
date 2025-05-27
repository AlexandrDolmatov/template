import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainPage from '../../diploma/src/pages/MainPage';
import ArtistPage from '../../diploma/src/pages/ArtistPage';
import Footer from '../../diploma/src/components/Footer';

/**
 * Главный компонент приложения, отвечает за роутинг и базовый layout.
 */
const App: React.FC = () => {
  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Можно добавить header, если нужно */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/artist/:name" element={<ArtistPage />} />
          {/* Если понадобится страница трека — можно добавить */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
