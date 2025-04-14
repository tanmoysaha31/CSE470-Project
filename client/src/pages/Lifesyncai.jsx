import React, { useContext } from 'react'
import { UserContext } from '/context/userContext'

export default function Profile() {
  const { user } = useContext(UserContext)
  
  return (
    <div>
      <h1>LifeSync AI</h1>
      <h2>This is AI page</h2>
      <p>note that this requirement is experimental, we may ditch it</p>
    </div>
  )
}
