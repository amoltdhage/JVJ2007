import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { LoadingProvider } from './LoadingContext';
import React from 'react';
import { persistor, store } from './src/Redux/Store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const Root = () => (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <LoadingProvider>
                <App />
            </LoadingProvider>
        </PersistGate>
    </Provider>
);

AppRegistry.registerComponent(appName, () => Root);