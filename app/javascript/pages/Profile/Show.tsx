import { Head, useForm, usePage } from '@inertiajs/react'

import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { SharedProps } from '@/types/inertia'

export default function ProfileShow({ time_zones }: { time_zones: string[] }) {
  const { auth } = usePage<SharedProps>().props
  const user = auth.user

  const profile = useForm({
    name: user?.name ?? '',
    time_zone: user?.time_zone ?? 'UTC',
    avatar: null as File | null,
  })

  const password = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Head title="Perfil" />
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

      <form
        className="mt-8 flex flex-col gap-4 rounded-2xl border bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault()
          // Inertia detecta o File e manda multipart sozinho.
          profile.patch('/profile', { forceFormData: true })
        }}
      >
        <h2 className="font-semibold">Dados da conta</h2>

        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={user?.avatar_url ?? undefined} alt="" />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>

          <Input
            label="Avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hint="PNG, JPEG ou WebP, até 2 MB."
            error={profile.errors.avatar}
            fieldClassName="flex-1"
            onChange={(event) => profile.setData('avatar', event.target.files?.[0] ?? null)}
          />
        </div>

        <Input
          label="Nome"
          required
          value={profile.data.name}
          error={profile.errors.name}
          onChange={(event) => profile.setData('name', event.target.value)}
        />

        <Select
          label="Fuso horário"
          value={profile.data.time_zone}
          error={profile.errors.time_zone}
          onChange={(event) => profile.setData('time_zone', event.target.value)}
        >
          {time_zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>

        <Button type="submit" className="self-start" disabled={profile.processing}>
          Salvar
        </Button>
      </form>

      <form
        className="mt-6 flex flex-col gap-4 rounded-2xl border bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault()
          password.patch('/profile/password', { onSuccess: () => password.reset() })
        }}
      >
        <h2 className="font-semibold">Trocar senha</h2>

        <Input
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          required
          value={password.data.current_password}
          error={password.errors.current_password}
          onChange={(event) => password.setData('current_password', event.target.value)}
        />

        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password.data.password}
          error={password.errors.password}
          onChange={(event) => password.setData('password', event.target.value)}
        />

        <Input
          label="Confirmação da nova senha"
          type="password"
          autoComplete="new-password"
          required
          value={password.data.password_confirmation}
          error={password.errors.password_confirmation}
          onChange={(event) => password.setData('password_confirmation', event.target.value)}
        />

        <Button
          type="submit"
          variant="outline"
          className="self-start"
          disabled={password.processing}
        >
          Trocar senha
        </Button>
      </form>
    </div>
  )
}
