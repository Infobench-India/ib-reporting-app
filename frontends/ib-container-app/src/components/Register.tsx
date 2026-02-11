import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try{
      const res = await axios.post(`${API_BASE}/register`, { email, password, firstName, lastName })
      alert('Registered: ' + res.data.user.email)
      setEmail(''); setPassword(''); setFirstName(''); setLastName('')
    }catch(err){
      console.error(err)
      alert('Registration failed')
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} style={{maxWidth:420}}>
      <h3>Register</h3>
      <div>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div>
        <label>First name</label>
        <input value={firstName} onChange={e=>setFirstName(e.target.value)} />
      </div>
      <div>
        <label>Last name</label>
        <input value={lastName} onChange={e=>setLastName(e.target.value)} />
      </div>
      <div style={{marginTop:8}}>
        <button type='submit' disabled={loading}>{loading? 'Registering...' : 'Register'}</button>
      </div>
    </form>
  )
}
