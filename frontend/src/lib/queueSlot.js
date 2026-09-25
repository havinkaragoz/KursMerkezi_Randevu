export const QUEUE_SLOT_MINUTES = 20

function formatTime(date) {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

export function queueSlotRange(sessionTime, position) {
  if (!sessionTime || !position) return null

  const start = new Date(sessionTime)
  start.setMinutes(start.getMinutes() + (position - 1) * QUEUE_SLOT_MINUTES)

  const end = new Date(start)
  end.setMinutes(end.getMinutes() + QUEUE_SLOT_MINUTES)

  return `${formatTime(start)} - ${formatTime(end)}`
}
