import { Head, useForm, usePage } from '@inertiajs/react'

import { AvatarPicker, type AvatarPreset } from '@/components/AvatarPicker'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { Select } from '@/components/Select'
import { Button } from '@/components/ui/button'
import type { SharedProps } from '@/types/inertia'

const CARD = 'mt-5 rounded-xl border bg-card p-5'

// Uma coluna abaixo de `md` porque no celular não há largura para duas; daí para cima o
// formulário lê em duas, e cada linha junta o que se decide junto.
const GRID = 'grid gap-x-5 gap-y-4 md:grid-cols-2'

export default function ProfileShow({
  time_zones,
  avatar_presets,
  avatar_preset: savedPreset,
}: {
  time_zones: string[]
  avatar_presets: AvatarPreset[]
  avatar_preset: string | null
}) {
  const { auth } = usePage<SharedProps>().props
  const user = auth.user

  const profile = useForm({
    name: user?.name ?? '',
    time_zone: user?.time_zone ?? 'UTC',
    avatar_preset: savedPreset ?? '',
    avatar: null as File | null,
  })

  const password = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Head title="Perfil" />

      <PageHeader>
        <h1 className="shrink-0 text-sm font-semibold tracking-tight">Perfil</h1>
        <span aria-hidden className="text-xs text-muted-foreground/40">
          /
        </span>
        <span className="min-w-0 truncate text-xs text-muted-foreground">{user?.email}</span>
      </PageHeader>

      <p className="text-sm text-muted-foreground">
        Nome, avatar e fuso horário valem para todos os workspaces.
      </p>

      <form
        className={CARD}
        onSubmit={(event) => {
          event.preventDefault()
          // Inertia detecta o File e manda multipart sozinho.
          profile.patch('/profile', { forceFormData: true })
        }}
      >
        <h2 className="text-sm font-semibold tracking-tight">Dados da conta</h2>

        <div className={`${GRID} mt-4`}>
          <div className="md:col-span-2">
            <AvatarPicker
              presets={avatar_presets}
              preset={profile.data.avatar_preset}
              file={profile.data.avatar}
              name={profile.data.name}
              savedUploadUrl={savedPreset ? null : (user?.avatar_url ?? null)}
              error={profile.errors.avatar ?? profile.errors.avatar_preset}
              onPick={(key) => profile.setData('avatar_preset', key)}
              onUpload={(file) => profile.setData('avatar', file)}
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
            onChange={(value) => profile.setData('time_zone', value)}
            options={time_zones.map((zone) => ({ value: zone, label: zone }))}
          />
        </div>

        <Button type="submit" className="mt-5" disabled={profile.processing}>
          Salvar
        </Button>
      </form>

      <form
        className={CARD}
        onSubmit={(event) => {
          event.preventDefault()
          password.patch('/profile/password', { onSuccess: () => password.reset() })
        }}
      >
        <h2 className="text-sm font-semibold tracking-tight">Trocar senha</h2>

        {/* Coluna da esquerda prova quem você é, a da direita é a senha nova: são dois
            passos, e lado a lado eles param de parecer uma lista de três campos iguais. */}
        <div className={`${GRID} mt-4 items-start`}>
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            required
            value={password.data.current_password}
            error={password.errors.current_password}
            onChange={(event) => password.setData('current_password', event.target.value)}
          />

          <div className="flex flex-col gap-4">
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
          </div>
        </div>

        <Button type="submit" variant="outline" className="mt-5" disabled={password.processing}>
          Trocar senha
        </Button>
      </form>
    </div>
  )
}
