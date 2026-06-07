import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import LandingPage from './pages/Landing/LandingPage';
import HomePage from './pages/HomePage/HomePage';
import HistoryPage from './pages/HistoryPage/HistoryPage';

const RoutesComponent = () => {
  return (
    <Routes>
      {/* Landing Page — 独立布局，无顶部导航 */}
      <Route index element={<LandingPage />} />

      {/* App 页面 — 带顶部导航 */}
      <Route element={<Layout />}>
        <Route path="tryon" element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
