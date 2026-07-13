import { useAuth } from '@bytebank/shared'
import { useEffect, useState } from 'react'

export default function useLoginPage() {
  const { login, error, loading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) window.location.assign('/')
  }, [isAuthenticated])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    try {
      await login(email, password)
      window.location.assign('/')
    } catch {
      setMessage('Não foi possível entrar. Verifique seus dados.')
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    message,
    loading,
    error,
    handleSubmit,
  }
}
