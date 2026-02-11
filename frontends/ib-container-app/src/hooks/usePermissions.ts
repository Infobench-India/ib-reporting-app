import useAuth from './useAuth'

export function usePermissions(){
  const { user } = useAuth()

  const hasPermission = (permission: string) => {
    return !!user?.permissions?.includes(permission)
  }

  const hasRole = (role: string) => {
    return user?.role === role
  }

  return { hasPermission, hasRole, user }
}
