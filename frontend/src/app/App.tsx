import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './router';
import { Toaster } from 'sonner';
import { fetchCurrentUser } from '@/features/auth/authSlice';

// Auth initializer component inside Redux Provider
const AppContent: React.FC = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(fetchCurrentUser());
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
