import { Link, useForm } from '@inertiajs/react'

import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/Input'
import { Button } from '@/components/ui/button'

export default function SignIn() {
  const form = useForm({ email: '', password: '', remember_me: true })

  return (
    <AuthShell
      title="Entrar"
      description="Use o e-mail e a senha da sua conta."
      footer={
        <>
          Não tem conta?{' '}
          <Link href="/users/sign_up" className="font-semibold text-foreground hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          form.transform((data) => ({ user: data }))
          form.post('/users/sign_in')
        }}
      >
        <Input
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.data.email}
          error={form.errors.email}
          onChange={(event) => form.setData('email', event.target.value)}
        />

        <Input
          label="Senha"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={form.data.password}
          error={form.errors.password}
          onChange={(event) => form.setData('password', event.target.value)}
        />

        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={form.data.remember_me}
            onChange={(event) => form.setData('remember_me', event.target.checked)}
          />
          Continuar conectado
        </label>

        <Button type="submit" disabled={form.processing}>
          Entrar
        </Button>

        <div className="flex justify-between">
          <Link href="/users/password/new" className="text-muted-foreground hover:underline">
            Esqueci minha senha
          </Link>
          <Link href="/users/confirmation/new" className="text-muted-foreground hover:underline">
            Reenviar confirmação
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
