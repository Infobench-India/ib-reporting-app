import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_AUTH_API_URL as string) || 'http://localhost:3051/api/auth'

function RoleCreate({ onCreated }: { onCreated: ()=>void }){
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const submit = async (e: React.FormEvent) =>{
    e.preventDefault()
    try{
      await axios.post(`${API_BASE}/roles`, { name, description: desc }, { withCredentials:true, headers:{ Authorization: `Bearer ${localStorage.getItem('accessToken')}` }})
      setName(''); setDesc('')
      onCreated()
    }catch(err){ console.error(err); alert('Failed to create role') }
  }
  return (
    <form onSubmit={submit} style={{marginBottom:12}}>
      <input placeholder='Role name' value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder='Description' value={desc} onChange={e=>setDesc(e.target.value)} />
      <button type='submit'>Create</button>
    </form>
  )
}

export default function RolesList(){
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetchData() },[])

  async function fetchData(){
    setLoading(true)
    try{ const res = await axios.get(`${API_BASE}/roles`, { withCredentials:true }); setRoles(res.data.roles || []) }catch(err){ console.error(err) }
    finally{ setLoading(false) }
  }

  return (
    <div>
      <h3>Roles</h3>
      <RoleCreate onCreated={fetchData} />
      {loading ? <div>Loading...</div> : (
        <ul>
          {roles.map(r=> <li key={r.id}>{r.name} - {r.description}</li>)}
        </ul>
      )}
    </div>
  )
}
