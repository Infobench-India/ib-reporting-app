# IB Container App

Host shell for microfrontends. Responsibilities:
- Central authentication/authorization
- Dynamically load microfrontends (e.g., ib-analytics-app)
- Provide RBAC context/hooks to remotes

Development:

```bash
cd frontends/ib-container-app
npm install
npm run dev
```

The container expects `ib-analytics-app` to expose a remote entry at `http://localhost:5003/assets/remoteEntry.js` and to expose `App` as `ib_analytics_app/App`.
