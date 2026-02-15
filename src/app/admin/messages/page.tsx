import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { MarkAsReadButton } from './mark-read-button'
import type { ContactMessage } from '@/types/database'

async function getMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as ContactMessage[]) || []
}

export default async function AdminMessagesPage() {
  const messages = await getMessages()

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
      <p className="mt-1 text-neutral-600">
        Contact form submissions
      </p>

      {messages.length > 0 ? (
        <div className="mt-8 space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={message.is_read ? 'opacity-75' : ''}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    <p className="text-sm text-neutral-500">
                      {message.email}
                      {message.phone && ` • ${message.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!message.is_read && (
                      <Badge variant="warning">New</Badge>
                    )}
                    <span className="text-sm text-neutral-500">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {message.subject && (
                  <p className="mb-2 font-medium text-neutral-900">
                    {message.subject}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-neutral-700">
                  {message.message}
                </p>
                <div className="mt-4 flex gap-2">
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    Reply via Email
                  </a>
                  {!message.is_read && (
                    <MarkAsReadButton messageId={message.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No messages yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
