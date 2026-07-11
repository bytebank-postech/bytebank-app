'use client'

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
          <p className={styles.eyebrow}>Bem-vindo de volta</p>
          <h1 className={styles.title}>Acesse sua conta</h1>
          <p className={styles.description}>
            Entre com seu e-mail e senha para continuar no ByteBank.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={styles.input}
            />
          </label>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {(error || message) && (
          <p className={styles.error}>{error ?? message}</p>
        )}
      </section>
    </main>
  )
}
