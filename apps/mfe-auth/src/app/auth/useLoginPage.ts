import { useAuth } from '@bytebank/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function useLoginPage() {
  const { login, error, loading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  if (isAuthenticated) {
    router.push('/')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    try {
      await login(email, password)
      router.push('/')
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
