import { Link, useForm } from '@inertiajs/react'

import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Button } from '@/components/ui/button'

const browserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

export default function SignUp({ time_zones }: { time_zones: string[] }) {
  const guessed = browserTimeZone()
  const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    time_zone: time_zones.includes(guessed) ? guessed : 'UTC',
  })

  return (
    <AuthShell
      title="Criar conta"
      description="Enviamos um e-mail de confirmação antes do primeiro acesso."
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/users/sign_in" className="font-semibold text-foreground hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          form.transform((data) => ({ user: data }))
          form.post('/users')
        }}
      >
        <Input
          label="Nome"
          autoComplete="name"
          required
          value={form.data.name}
          error={form.errors.name}
          onChange={(event) => form.setData('name', event.target.value)}
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={form.data.email}
          error={form.errors.email}
          onChange={(event) => form.setData('email', event.target.value)}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="Mínimo de 8 caracteres."
          value={form.data.password}
          error={form.errors.password}
          onChange={(event) => form.setData('password', event.target.value)}
        />

        <Input
          label="Confirmação de senha"
          type="password"
          autoComplete="new-password"
          required
          value={form.data.password_confirmation}
          error={form.errors.password_confirmation}
          onChange={(event) => form.setData('password_confirmation', event.target.value)}
        />

        <Select
          label="Fuso horário"
          value={form.data.time_zone}
          error={form.errors.time_zone}
          onChange={(event) => form.setData('time_zone', event.target.value)}
        >
          {time_zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>

        <Button type="submit" disabled={form.processing}>
          Criar conta
        </Button>
      </form>
    </AuthShell>
  )
}
