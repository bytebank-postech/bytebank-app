import { useAuth } from '@bytebank/shared'
import { useEffect, useState } from 'react'

export default function useLoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.assign('/')
    }
  }, [authLoading, isAuthenticated])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.')
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      window.location.assign('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    handleSubmit,
  }
}
