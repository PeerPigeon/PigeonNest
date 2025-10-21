<template>
  <div class="event-log">
    <div class="event-log-list">
      <div v-for="(msg, index) in messages" :key="index" class="event-item">
        <strong class="event-time">[{{ formatTime(msg.timestamp) }}]</strong> 
        <span class="event-text">{{ msg.text }}</span>
      </div>
      <div v-if="messages.length === 0" class="empty-state">
        No events yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LogMessage {
  text: string
  timestamp: number
}

defineProps<{
  messages: LogMessage[]
}>()

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
.event-log {
  width: 100%;
}

.event-log-list {
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.event-item {
  padding: 6px 0;
  border-bottom: 1px solid #e0e0e0;
  line-height: 1.5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  color: #666;
  font-weight: 600;
  margin-right: 8px;
}

.event-text {
  color: #333;
}

.empty-state {
  color: #999;
  text-align: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
