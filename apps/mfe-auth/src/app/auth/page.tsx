'use client'

import Link from 'next/link'
import { Button, Input, Typography } from '@bytebank/ui'
import AuthLayout from '../../components/auth/AuthLayout'
import layoutStyles from '../../components/auth/AuthLayout.module.scss'
import useLoginPage from './useLoginPage'

export default function AuthPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    handleSubmit,
  } = useLoginPage()

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta ByteBank"
      footer={
        <>
          <Typography variant="body-sm" classname={layoutStyles.footerMuted}>
            Não tem uma conta?
          </Typography>
          <Link href="/auth/cadastro" className={layoutStyles.footerAction}>
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={layoutStyles.form}>
        <label className={layoutStyles.field}>
          <Typography variant="title" color="active">
            E-mail
          </Typography>
          <Input
            fullWidth
            paddingSize="large"
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            value={email}
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className={layoutStyles.field}>
          <Typography variant="title" color="active">
            Senha
          </Typography>
          <Input
            fullWidth
            paddingSize="large"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? (
          <Typography variant="body-sm" color="error">
            {error}
          </Typography>
        ) : null}

        <Button type="submit" fullWidth size="large" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}
