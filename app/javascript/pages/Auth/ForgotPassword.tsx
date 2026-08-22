import { Link, useForm } from '@inertiajs/react'

import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/Input'
import { Button } from '@/components/ui/button'

export default function ForgotPassword() {
  const form = useForm({ email: '' })

  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Mandamos um link de redefinição válido por algumas horas."
      footer={
        <Link href="/users/sign_in" className="font-semibold text-foreground hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          form.transform((data) => ({ user: data }))
          form.post('/users/password')
        }}
      >
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={form.data.email}
          error={form.errors.email}
          onChange={(event) => form.setData('email', event.target.value)}
        />

        <Button type="submit" disabled={form.processing}>
          Enviar link
        </Button>
      </form>
    </AuthShell>
  )
}
