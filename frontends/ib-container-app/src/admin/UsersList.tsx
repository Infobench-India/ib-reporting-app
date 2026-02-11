import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth'

export default function UsersList(){
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetchData() },[])

  async function fetchData(){
    setLoading(true)
    try{
      const [uRes, rRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, { withCredentials:true }),
        axios.get(`${API_BASE}/roles`, { withCredentials:true })
      ])
      setUsers(uRes.data.users || [])
      setRoles(rRes.data.roles || [])
    }catch(err){ console.error(err) }
    finally{ setLoading(false) }
  }

  async function changeRole(userId: string, roleId: string){
    try{
      await axios.put(`${API_BASE}/users/${userId}/role`, { roleId }, { withCredentials:true, headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }})
      alert('Role updated')
      fetchData()
    }catch(err){ console.error(err); alert('Failed to update role') }
  }

  return (
    <div>
      <h3>Users</h3>
      {loading ? <div>Loading...</div> : (
        <table border={1} cellPadding={6} style={{borderCollapse:'collapse'}}>
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Change Role</th></tr></thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.role}</td>
                <td>
                  <select defaultValue={u.roleId || ''} onChange={(e)=>changeRole(u.id, e.target.value)}>
                    <option value=''>--select--</option>
                    {roles.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
