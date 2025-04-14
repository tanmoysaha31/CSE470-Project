import React, { useContext } from 'react'
import { UserContext } from '/context/userContext'

export default function Profile() {
  const { user } = useContext(UserContext)
  
  return (
    <div>
      <h1>Calendar</h1>
      <h2>This is calendar page</h2>
    </div>
  )
}
