<template>
  <div class="stream-progress">
    <div class="stream-header">
      <div class="stream-info">
        <div class="stream-filename">{{ stream.filename }}</div>
        <div class="stream-meta">
          <span class="stream-peer">{{ truncatePeerId(stream.peerId) }}</span>
          <span class="stream-size">{{ formatFileSize(stream.totalSize) }}</span>
        </div>
      </div>
      
      <div class="stream-status" :class="`status-${stream.status}`">
        {{ statusText }}
      </div>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :class="`status-${stream.status}`"
        :style="{ width: `${stream.progress}%` }"
      ></div>
    </div>
    
    <div class="stream-footer">
      <div class="transfer-info">
        <span>{{ formatFileSize(stream.bytesTransferred) }} / {{ formatFileSize(stream.totalSize) }}</span>
        <span>{{ stream.progress.toFixed(1) }}%</span>
      </div>
      
      <div class="stream-actions">
        <button 
          v-if="stream.status === 'active' && onCancel"
          @click="$emit('cancel', stream.streamId)"
          class="cancel-btn"
        >
          Cancel
        </button>
        <button 
          v-if="stream.status === 'error' && onRetry"
          @click="$emit('retry', stream.streamId)"
          class="retry-btn"
        >
          Retry
        </button>
        <button 
          v-if="stream.status === 'completed' && onDismiss"
          @click="$emit('dismiss', stream.streamId)"
          class="dismiss-btn"
        >
          Dismiss
        </button>
      </div>
    </div>
    
    <div v-if="stream.error" class="error-message">
      {{ stream.error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StreamProgress } from '../composables/usePeerStreaming'

interface StreamProgressProps {
  stream: StreamProgress
  onCancel?: boolean
  onRetry?: boolean
  onDismiss?: boolean
}

const props = withDefaults(defineProps<StreamProgressProps>(), {
  onCancel: true,
  onRetry: true,
  onDismiss: true
})

defineEmits<{
  cancel: [streamId: string]
  retry: [streamId: string]
  dismiss: [streamId: string]
}>()

const statusText = computed(() => {
  switch (props.stream.status) {
    case 'pending':
      return 'Pending'
    case 'active':
      return 'Transferring'
    case 'completed':
      return 'Completed'
    case 'error':
      return 'Error'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Unknown'
  }
})

const truncatePeerId = (peerId: string): string => {
  if (peerId.length <= 12) return peerId
  return `${peerId.substring(0, 6)}...${peerId.substring(peerId.length - 6)}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
</script>

<style scoped>
.stream-progress {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.stream-info {
  flex: 1;
}

.stream-filename {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.stream-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.stream-peer,
.stream-size {
  font-family: monospace;
}

.stream-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stream-status.status-pending {
  background: #e0e0e0;
  color: #666;
}

.stream-status.status-active {
  background: #e3f2fd;
  color: #1976d2;
}

.stream-status.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.stream-status.status-error {
  background: #ffebee;
  color: #f44336;
}

.stream-status.status-cancelled {
  background: #fff3e0;
  color: #ff9800;
}

.progress-bar {
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.status-pending,
.progress-fill.status-active {
  background: #1976d2;
}

.progress-fill.status-completed {
  background: #4caf50;
}

.progress-fill.status-error {
  background: #f44336;
}

.progress-fill.status-cancelled {
  background: #ff9800;
}

.stream-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transfer-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
  font-family: monospace;
}

.stream-actions {
  display: flex;
  gap: 8px;
}

.cancel-btn,
.retry-btn,
.dismiss-btn {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.cancel-btn:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.retry-btn:hover {
  background: #e3f2fd;
  border-color: #1976d2;
  color: #1976d2;
}

.dismiss-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.error-message {
  margin-top: 12px;
  padding: 8px 12px;
  background: #ffebee;
  border-left: 3px solid #f44336;
  border-radius: 4px;
  font-size: 13px;
  color: #c62828;
}
</style>
