import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { CustomThemeProvider } from './theme/ColorModeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <CustomThemeProvider>
        <App />
      </CustomThemeProvider>
    </Provider>
  </StrictMode>,
);
