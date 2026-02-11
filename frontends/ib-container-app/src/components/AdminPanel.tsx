import React, { useState } from 'react'
import UsersList from '../admin/UsersList'
import RolesList from '../admin/RolesList'
import PermissionsList from '../admin/PermissionsList'
import { usePermissions } from '../hooks/usePermissions'

export default function AdminPanel(){
  try {
    const { hasRole } = usePermissions()
    const [tab, setTab] = useState<'users'|'roles'|'permissions'>('users')

    if (!hasRole('Admin')) return <div>Access denied. Admins only.</div>

  return (
    <div style={{marginTop:20}}>
      <h2>Admin Panel</h2>
      <div style={{display:'flex', gap:8}}>
        <button onClick={()=>setTab('users')}>Users</button>
        <button onClick={()=>setTab('roles')}>Roles</button>
        <button onClick={()=>setTab('permissions')}>Permissions</button>
      </div>
      <div style={{marginTop:12}}>
        {tab === 'users' && <UsersList />}
        {tab === 'roles' && <RolesList />}
        {tab === 'permissions' && <PermissionsList />}
      </div>
    </div>
  )
  } catch(e) {
    console.error('AdminPanel error:', e)
    return <div style={{color:'red'}}>Admin panel error: {String(e)}</div>
  }
}
