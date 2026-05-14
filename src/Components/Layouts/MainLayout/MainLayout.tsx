"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistedStore } from "@/Redux/store";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default MainLayout;
