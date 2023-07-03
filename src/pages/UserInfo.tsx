import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
export const UserInfo = () => {
    const {isAuthenticated, user} = useAuth0();
  return (
    <div>{isAuthenticated && <div><div>{user?.family_name}</div><div>{user?.email}</div></div>}{!isAuthenticated && <div>NOT AUTHENTICATED</div>}</div>
  )
}
