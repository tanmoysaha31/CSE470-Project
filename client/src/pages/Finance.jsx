import React, { useContext } from 'react'
import { UserContext } from '/context/userContext'

export default function Profile() {
  const { user } = useContext(UserContext)
  
  return (
    <div>
      <h1>Finance</h1>
      <h2>This is finance page</h2>
    </div>
  )
}
