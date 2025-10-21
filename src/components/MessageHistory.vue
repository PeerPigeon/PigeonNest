<template>
  <div class="message-history">
    <div class="message-history-header">
      <h3>Message History</h3>
      <span class="message-count">{{ messages.length }} messages</span>
    </div>
    
    <div class="message-history-body">
      <div v-if="messages.length === 0" class="empty-state">
        No messages yet. Start a conversation!
      </div>
      <div v-else class="messages-list">
        <div 
          v-for="msg in messages" 
          :key="msg.timestamp" 
          class="message-wrapper"
          :class="msg.direction"
        >
          <div class="message-bubble">
            <div class="message-meta">
              {{ msg.direction === 'sent' ? '📤 To' : '📥 From' }}: {{ formatPeerId(msg.peerId) }}
            </div>
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">
              {{ formatTime(msg.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  direction: 'sent' | 'received'
  peerId: string
  content: string
  timestamp: number
}

defineProps<{
  messages: Message[]
}>()

const formatPeerId = (peerId: string): string => {
  if (peerId === 'broadcast') return '📢 All Peers'
  return peerId.length > 8 ? `${peerId.substring(0, 8)}...` : peerId
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.message-history {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.message-history-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-history-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.message-count {
  font-size: 14px;
  color: #666;
}

.message-history-body {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px;
  background: white;
}

.empty-state {
  color: #999;
  padding: 40px 20px;
  text-align: center;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message-wrapper.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
}

.sent .message-bubble {
  background: #007bff;
  color: white;
}

.received .message-bubble {
  background: #e9ecef;
  color: #333;
}

.message-meta {
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
  word-break: break-word;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}
</style>
