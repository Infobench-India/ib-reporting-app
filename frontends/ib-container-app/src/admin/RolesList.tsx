import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_AUTH_API_URL as string) || 'http://localhost:3051/api/auth'

function RoleCreate({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/roles`, { name, description: desc }, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      setName(''); setDesc('')
      onCreated()
    } catch (err) { console.error(err); alert('Failed to create role') }
  }
  return (
    <form onSubmit={submit} style={{ marginBottom: 12 }}>
      <input placeholder='Role name' value={name} onChange={e => setName(e.target.value)} />
      <input placeholder='Description' value={desc} onChange={e => setDesc(e.target.value)} />
      <button type='submit'>Create</button>
    </form>
  )
}

function RoleItem({ r, allPermissions, onUpdated }: { r: any, allPermissions: any[], onUpdated: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isManagingPermissions, setIsManagingPermissions] = useState(false)
  const [name, setName] = useState(r.name)
  const [desc, setDesc] = useState(r.description)
  const [rolePermissions, setRolePermissions] = useState<any[]>([])

  const fetchRoleData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/roles/${r.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      setRolePermissions(res.data.permissions || [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (isManagingPermissions) fetchRoleData()
  }, [isManagingPermissions])

  const update = async () => {
    try {
      await axios.put(`${API_BASE}/roles/${r.id}`, { name, description: desc }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      setIsEditing(false)
      onUpdated()
    } catch (err) { console.error(err); alert('Failed to update role') }
  }

  const togglePermission = async (pId: string, isAssigned: boolean) => {
    try {
      const endpoint = isAssigned ? 'remove-permission' : 'assign-permission'
      await axios.post(`${API_BASE}/roles/${endpoint}`, { roleId: r.id, permissionId: pId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      fetchRoleData()
    } catch (err) { console.error(err); alert('Failed to update permission') }
  }

  return (
    <li style={{ marginBottom: 16, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
      {isEditing ? (
        <div>
          <input value={name} onChange={e => setName(e.target.value)} />
          <input value={desc} onChange={e => setDesc(e.target.value)} />
          <button onClick={update}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <strong>{r.name}</strong> - {r.description}
          <button onClick={() => setIsEditing(true)} style={{ marginLeft: 8 }}>Edit</button>
          <button onClick={() => setIsManagingPermissions(!isManagingPermissions)} style={{ marginLeft: 8 }}>
            {isManagingPermissions ? 'Discard Changes' : 'Manage Permissions'}
          </button>
        </div>
      )}

      {isManagingPermissions && (
        <div style={{ marginTop: 8, padding: 8, background: '#f9f9f9' }}>
          <h5>Assign Permissions</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
            {allPermissions.map(p => {
              const isAssigned = rolePermissions.some(rp => rp.id === p.id)
              return (
                <label key={p.id} style={{ fontSize: '0.9em' }}>
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => togglePermission(p.id, isAssigned)}
                  />
                  {p.name}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </li>
  )
}

export default function RolesList() {
  const [roles, setRoles] = useState<any[]>([])
  const [allPermissions, setAllPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
    fetchAllPermissions()
  }, [])

  async function fetchAllPermissions() {
    try {
      const res = await axios.get(`${API_BASE}/permissions`, { withCredentials: true })
      setAllPermissions(res.data.permissions || [])
    } catch (err) { console.error(err) }
  }

  async function fetchData() {
    setLoading(true)
    try { const res = await axios.get(`${API_BASE}/roles`, { withCredentials: true }); setRoles(res.data.roles || []) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h3>Roles</h3>
      <RoleCreate onCreated={fetchData} />
      {loading ? <div>Loading...</div> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {roles.map(r => <RoleItem key={r.id} r={r} allPermissions={allPermissions} onUpdated={fetchData} />)}
        </ul>
      )}
    </div>
  )
}
