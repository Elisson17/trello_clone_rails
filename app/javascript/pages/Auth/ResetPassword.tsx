import { useForm } from '@inertiajs/react'

import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/Input'
import { Button } from '@/components/ui/button'

export default function ResetPassword({ reset_password_token }: { reset_password_token: string }) {
  const form = useForm({
    reset_password_token,
    password: '',
    password_confirmation: '',
  })

  return (
    <AuthShell title="Nova senha" description="Escolha uma senha que você ainda não usou aqui.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          form.transform((data) => ({ user: data }))
          form.put('/users/password')
        }}
      >
        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
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

        <Button type="submit" disabled={form.processing}>
          Salvar senha
        </Button>
      </form>
    </AuthShell>
  )
}
