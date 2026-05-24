import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import RoutesComponent from './app.tsx';
import './index.css';
import { createPortal } from 'react-dom';
import { Toaster } from '@client/src/components/ui/sonner';

const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH || '/';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>出错了</h1>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
};

const MainApp = () => {
  return (
    <BrowserRouter basename={CLIENT_BASE_PATH}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error as Error}
            resetErrorBoundary={resetErrorBoundary}
          />
        )}
      >
        <RoutesComponent />
        {createPortal(<Toaster />, document.body)}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
