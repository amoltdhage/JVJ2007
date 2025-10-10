import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { LoadingProvider } from './LoadingContext';
import React from 'react';
import { persistor, store } from './src/Redux/Store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import i18n from "./src/i18n/i18n";
import { I18nextProvider } from 'react-i18next';

const Root = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <I18nextProvider i18n={i18n}>
        <LoadingProvider>
        <App />
      </LoadingProvider>
      </I18nextProvider>
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
