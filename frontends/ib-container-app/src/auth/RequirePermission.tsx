import React, { ReactNode } from 'react'
import { usePermissions } from '../hooks/usePermissions'

type Props = {
  permission: string
  children: ReactNode
}

export default function RequirePermission({ permission, children }: Props) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) return null
  return <>{children}</>
}
