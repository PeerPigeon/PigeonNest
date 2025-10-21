<template>
  <div class="chat-section">
    <h2>💬 Chat</h2>
    
    <!-- Message History -->
    <div class="message-history">
      <div class="history-header">
        <h3>Message History</h3>
        <span class="msg-count">{{ messages.length }} messages</span>
      </div>
      <div class="history-body">
        <div v-if="messages.length === 0" class="empty">
          No messages yet. Start a conversation!
        </div>
        <div v-else class="msg-list">
          <div v-for="msg in messages" :key="msg.timestamp" class="msg-item" :class="msg.direction">
            <div class="bubble">
              <div class="meta">{{ msg.direction === 'sent' ? '📤 To' : '📥 From' }}: {{ formatPeerId(msg.peerId) }}</div>
              <div class="content">{{ msg.content }}</div>
              <div class="time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Peer Selector -->
    <div class="peer-selector">
      <label>Send message to:</label>
      <select v-model="selectedPeer" class="peer-dropdown">
        <option value="">Choose target...</option>
        <option value="__all__">📢 Broadcast to all peers</option>
        <option v-for="peerId in peers" :key="peerId" :value="peerId">
          {{ formatPeerId(peerId) }}
        </option>
      </select>
    </div>

    <!-- Message Input -->
    <div class="input-box">
      <textarea
        v-model="inputText"
        placeholder="Type your message here..."
        rows="4"
        class="input-area"
      ></textarea>
      <button
        @click="handleSend"
        class="send-btn"
        :disabled="!inputText.trim() || disabled"
      >
        📤 Send Message
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  direction: 'sent' | 'received'
  peerId: string
  content: string
  timestamp: number
}

const props = defineProps<{
  messages: Message[]
  peers: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [message: string, target: string | null]
}>()

const inputText = ref('')
const selectedPeer = ref('')

const handleSend = () => {
  if (!inputText.value.trim() || props.disabled) return
  
  // Don't send if no peer is selected
  if (!selectedPeer.value) {
    return
  }
  
  const target = selectedPeer.value === '__all__' ? null : selectedPeer.value
  emit('send', inputText.value, target)
  inputText.value = ''
}

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
.chat-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-section h2 {
  margin: 0;
  color: #333;
}

.message-history {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.history-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.msg-count {
  font-size: 14px;
  color: #666;
}

.history-body {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px;
  background: white;
}

.empty {
  color: #999;
  text-align: center;
  padding: 40px 20px;
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg-item {
  display: flex;
}

.msg-item.sent {
  justify-content: flex-end;
}

.msg-item.received {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
}

.sent .bubble {
  background: #007bff;
  color: white;
}

.received .bubble {
  background: #e9ecef;
  color: #333;
}

.meta {
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.content {
  font-size: 14px;
  word-break: break-word;
}

.time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.peer-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.peer-selector label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.peer-dropdown {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.peer-dropdown:focus {
  outline: none;
  border-color: #1976d2;
}

.input-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border: 3px solid #1976d2;
  border-radius: 8px;
  position: relative;
  z-index: 100;
}

.input-area {
  width: 100%;
  padding: 12px;
  border: 2px solid #1976d2;
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.input-area:focus {
  outline: none;
  border-color: #0d47a1;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
}

.send-btn {
  padding: 12px 24px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end;
}

.send-btn:hover:not(:disabled) {
  background: #1565c0;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
