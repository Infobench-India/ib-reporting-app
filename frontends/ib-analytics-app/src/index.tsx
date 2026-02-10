
import React from "react";
import "./scss/style.scss";
import { ErrorBoundary } from 'react-error-boundary';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from "./store";
import App from "./App";
import ErrorHandler from "./components/ErrorHandler";
import ToastNotifications from "./common/ToastNotifications";
const container: Element | DocumentFragment | null = document.getElementById('root');

// prepare store
const root = createRoot(container!);
  root.render(<Provider store={store}>
    <ErrorBoundary FallbackComponent={ErrorHandler}>
        <ToastNotifications />
      <App></App>
    </ErrorBoundary>
  </Provider>);
