import React, { useContext } from 'react'
import { UserContext } from '/context/userContext'

export default function Overview() {
  const { user } = useContext(UserContext)
  
  return (
    <div>
      <h1>Overview</h1>
      <h2>This is Overview page</h2>
    </div>
  )
}
