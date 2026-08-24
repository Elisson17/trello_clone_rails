import { router, usePage } from '@inertiajs/react'
import { createConsumer } from '@rails/actioncable'
import { useEffect } from 'react'

import type { SharedProps } from '@/types/inertia'

/**
 * Realtime do board sem estado duplicado: o WebSocket só avisa que algo mudou e quem
 * mudou; quem busca o dado novo é o Inertia, então a fonte de verdade continua sendo uma.
 *
 * Quem originou a mudança ignora o próprio evento — ele já recebeu os props na resposta.
 */
export function useBoardChannel(boardId: number) {
  const currentUserId = usePage<SharedProps>().props.auth.user?.id

  useEffect(() => {
    const consumer = createConsumer()
    const subscription = consumer.subscriptions.create(
      { channel: 'BoardChannel', id: boardId },
      {
        received(event: { type: string; by: number | null }) {
          if (event.by === currentUserId) return

          // `only` remonta só o payload do board e o contador do sino: o resto da página
          // (e o modal do card aberto) fica de pé.
          router.reload({ only: ['board', 'unread_notifications_count'] })
        },
      },
    )

    return () => {
      subscription.unsubscribe()
      consumer.disconnect()
    }
  }, [boardId, currentUserId])
}
