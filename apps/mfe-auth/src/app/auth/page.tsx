'use client'

import { Button, Input, Typography } from '@bytebank/ui'
import styles from './page.module.scss'
import useLoginPage from './useLoginPage'

export default function AuthPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    message,
    loading,
    error,
    handleSubmit,
  } = useLoginPage()

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <Typography variant="title">Bem-vindo de volta</Typography>
          <Typography variant="title-lg">Acesse sua conta</Typography>
          <Typography variant="body">
            Entre com seu e-mail e senha para continuar no ByteBank.
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <Typography color="active">E-mail</Typography>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
            />
          </label>

          <label className={styles.field}>
            <Typography color="active">Senha</Typography>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {(error || message) && (
          <Typography color="error" classname={styles.error}>
            {error ?? message}
          </Typography>
        )}
      </section>
    </main>
  )
}
