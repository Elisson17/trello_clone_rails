import { router, usePage } from '@inertiajs/react'
import { createConsumer } from '@rails/actioncable'
import { useEffect, useMemo, useState } from 'react'

import {
  EMPTY_PRESENCE,
  type PresenceEvent,
  type PresenceState,
  presenceReducer,
  presentUsers,
} from '@/lib/presence'
import type { SharedProps } from '@/types/inertia'

type BoardEvent = { type: string; by: number | null }
type ChannelEvent = BoardEvent | PresenceEvent

function isPresenceEvent(event: ChannelEvent): event is PresenceEvent {
  return event.type.startsWith('presence.')
}

/**
 * Realtime do board sem estado duplicado: o WebSocket só avisa que algo mudou e quem
 * mudou; quem busca o dado novo é o Inertia, então a fonte de verdade continua sendo uma.
 *
 * Quem originou a mudança ignora o próprio evento — ele já recebeu os props na resposta.
 *
 * A presença é a exceção: ela não mora no servidor nem no payload, é montada aqui a partir
 * das mensagens do canal e morre junto com a página.
 */
export function useBoardChannel(boardId: number) {
  const currentUserId = usePage<SharedProps>().props.auth.user?.id
  const [presence, setPresence] = useState<PresenceState>(EMPTY_PRESENCE)

  useEffect(() => {
    const consumer = createConsumer()
    const subscription = consumer.subscriptions.create(
      { channel: 'BoardChannel', id: boardId },
      {
        connected() {
          announce()
        },

        received(event: ChannelEvent) {
          // A chamada de presença: quem já estava aqui responde com o próprio estado.
          if (event.type === 'presence.roll_call') return announce()

          if (isPresenceEvent(event)) {
            return setPresence((state) => presenceReducer(state, event))
          }

          if (event.by === currentUserId) return

          // `only` remonta só o payload do board e o contador do sino: o resto da página
          // (e o modal do card aberto) fica de pé.
          router.reload({ only: ['board', 'unread_notifications_count'] })
        },
      },
    )

    const announce = () => subscription.perform('state', { active: !document.hidden })

    document.addEventListener('visibilitychange', announce)

    return () => {
      document.removeEventListener('visibilitychange', announce)
      subscription.unsubscribe()
      consumer.disconnect()
      setPresence(EMPTY_PRESENCE)
    }
  }, [boardId, currentUserId])

  return useMemo(
    () => ({ presence: presentUsers(presence, currentUserId ?? 0) }),
    [presence, currentUserId],
  )
}
