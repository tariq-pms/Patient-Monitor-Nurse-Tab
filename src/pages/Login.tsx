import { TextField } from '@mui/material'
import React from 'react'

export default function Login() {
  return (
    <div>
        <TextField
            required
          label="Username"
          type='username'
          variant="filled"
        />
        <TextField 
            required
          label="Password"
          variant='filled'
          type='password'
        />
    </div>
  )
}
