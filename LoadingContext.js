import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext({
  startLoading: () => {},
  stopLoading: () => {},
  isLoading: false,
});

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((count) => count + 1);
  const stopLoading = () => setLoadingCount((count) => Math.max(0, count - 1));

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);