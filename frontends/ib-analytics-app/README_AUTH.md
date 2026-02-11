Using `ib-container-app` Auth utilities

The container app exposes auth utilities via Module Federation as `ib_container_app/Auth`.

Example usage inside a remote microfrontend (runtime import):

```ts
// dynamic import (when container is loaded)
const { useAuth, usePermissions, RequirePermission } = await window.ib_container_app.get('./Auth').then((m)=>m());

// or if your bundler supports federation resolution:
import { useAuth } from 'ib_container_app/Auth'
```

Notes:
- Ensure the `ib-container-app` host is running and its remote entry is available to load.
- Use `RequirePermission` to guard UI components.
