import React, { useContext } from 'react'
import { UserContext } from '/context/userContext'

export default function Profile() {
  const { user } = useContext(UserContext)
  
  return (
    <div>
      <h1>Tasks</h1>
      <h2>This is tasks page</h2>
    </div>
  )
}
