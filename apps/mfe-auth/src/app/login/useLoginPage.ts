import { useAuth } from '@/contexts/AuthProvider/AuthProvider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function useLoginPage() {
  const { login, error, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

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
