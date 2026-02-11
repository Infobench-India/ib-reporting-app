import React, { Suspense, useState } from 'react'
import RemoteLoader from './components/RemoteLoader'
import Login from './components/Login'
import useAuth from './hooks/useAuth'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [remoteLoaded, setRemoteLoaded] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div style={{ padding: 20 }}>
        <h1>IB Container App (Host)</h1>
        <p>Responsible for authentication, authorization and loading microfrontends.</p>

        <div style={{ marginTop: 20 }}>
          {!user ? (
            <div style={{display:'flex', gap:12}}>
              <Login />
            </div>
          ) : (
            <div>
              <div>Signed in as: {user.email} ({user.role})</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => logout()}>Logout</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button onClick={async () => {
              try {
                await RemoteLoader.load('http://localhost:5003/assets/remoteEntry.js')
                setRemoteLoaded(true)
              } catch (e) {
                console.error('Failed to load remote:', e)
                alert('Failed to load remote. Make sure ib-analytics-app is running on port 5003')
              }
            }}>Load ib-analytics-app</button>
          </div>

          <AdminPanel />
        </div>

        <div style={{ marginTop: 20 }}>
          {remoteLoaded ? (
            <Suspense fallback={<div>Loading remote app...</div>}>
              {/** Expect remote to expose `App` as `ib_analytics_app/App` **/}
              {/* @ts-ignore */}
              <RemoteApp />
            </Suspense>
          ) : null}
        </div>
      </div>
    )
  }

  // dynamic import wrapper
  const RemoteApp = React.lazy(() => import('ib_analytics_app/App'))
