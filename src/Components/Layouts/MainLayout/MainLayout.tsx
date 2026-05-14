'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

 
import { store, persistedStore } from '@/Redux/store'; 
import { ThemeProvider } from '@mui/material/styles';  
import theme from '@/configs/themeConfig';  
 

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <ThemeProvider theme={theme}>
        
          {children}
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default MainLayout;