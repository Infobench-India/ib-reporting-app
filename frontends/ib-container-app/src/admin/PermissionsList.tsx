import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth'

function PermissionCreate({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/permissions`, { name, action, resource }, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      setName(''); setAction(''); setResource('')
      onCreated()
    } catch (err) { console.error(err); alert('Failed to create permission') }
  }
  return (
    <form onSubmit={submit} style={{ marginBottom: 12 }}>
      <input placeholder='Name' value={name} onChange={e => setName(e.target.value)} />
      <input placeholder='Action' value={action} onChange={e => setAction(e.target.value)} />
      <input placeholder='Resource' value={resource} onChange={e => setResource(e.target.value)} />
      <button type='submit'>Create</button>
    </form>
  )
}

function PermissionItem({ p, onUpdated }: { p: any, onUpdated: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(p.name)
  const [action, setAction] = useState(p.action)
  const [resource, setResource] = useState(p.resource)

  const update = async () => {
    try {
      await axios.put(`${API_BASE}/permissions/${p.id}`, { name, action, resource }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      setIsEditing(false)
      onUpdated()
    } catch (err) {
      console.error(err)
      alert('Failed to update permission')
    }
  }

  if (isEditing) {
    return (
      <li>
        <input value={name} onChange={e => setName(e.target.value)} />
        <input value={action} onChange={e => setAction(e.target.value)} />
        <input value={resource} onChange={e => setResource(e.target.value)} />
        <button onClick={update}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </li>
    )
  }

  return (
    <li>
      {p.name} - {p.action}/{p.resource}
      <button onClick={() => setIsEditing(true)} style={{ marginLeft: 8 }}>Edit</button>
    </li>
  )
}

export default function PermissionsList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try { const res = await axios.get(`${API_BASE}/permissions`, { withCredentials: true }); setItems(res.data.permissions || []) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h3>Permissions</h3>
      <PermissionCreate onCreated={fetchData} />
      {loading ? <div>Loading...</div> : (
        <ul>
          {items.map(p => <PermissionItem key={p.id} p={p} onUpdated={fetchData} />)}
        </ul>
      )}
    </div>
  )
}
