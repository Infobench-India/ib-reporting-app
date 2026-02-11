import React, { useState, useContext } from 'react'
import { AuthContext } from '../auth/AuthProvider'

export default function Login(){
  const ctx = useContext(AuthContext)
  const [email, setEmail] = useState('admin@infobench.in')
  const [password, setPassword] = useState('Test@123456')
  const [loading, setLoading] = useState(false)

  if(!ctx) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try{
      await ctx.login(email, password)
      alert('Login successful')
    }catch(err){
      console.error(err)
      alert('Login failed')
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={submit} style={{maxWidth:360}}>
      <div>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div style={{marginTop:10}}>
        <button type="submit" disabled={loading}>{loading? 'Logging...' : 'Login'}</button>
      </div>
    </form>
  )
}
