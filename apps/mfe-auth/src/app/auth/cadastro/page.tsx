'use client'

import Link from 'next/link'
import { Button, Input, Typography } from '@bytebank/ui'
import AuthLayout from '../../../components/auth/AuthLayout'
import layoutStyles from '../../../components/auth/AuthLayout.module.scss'
import useCadastroPage from './useCadastroPage'

export default function CadastroPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    submitting,
    handleSubmit,
  } = useCadastroPage()

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Crie sua conta ByteBank"
      footer={
        <>
          <Typography variant="body-sm" classname={layoutStyles.footerMuted}>
            Já tem uma conta?
          </Typography>
          <Link href="/auth" className={layoutStyles.footerAction}>
            Entrar
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
            autoComplete="new-password"
            placeholder="Digite sua senha"
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className={layoutStyles.field}>
          <Typography variant="title" color="active">
            Confirmar senha
          </Typography>
          <Input
            fullWidth
            paddingSize="large"
            type="password"
            autoComplete="new-password"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            disabled={submitting}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        {error ? (
          <Typography variant="body-sm" color="error">
            {error}
          </Typography>
        ) : null}

        <Button type="submit" fullWidth size="large" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
