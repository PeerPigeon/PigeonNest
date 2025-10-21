<template>
  <div v-if="streams.length > 0" class="stream-container">
    <div class="streams-list">
      <stream-progress 
        v-for="stream in streams" 
        :key="stream.streamId"
        :stream="stream"
        @cancel="handleCancel"
        @dismiss="handleDismiss"
        @download="handleDownload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import StreamProgress from './StreamProgress.vue'

interface Stream {
  streamId: string
  peerId: string
  filename: string
  totalSize: number
  bytesTransferred: number
  progress: number
  status: 'pending' | 'active' | 'completed' | 'error' | 'cancelled'
  direction: 'send' | 'receive'
  error?: Error
  receivedBlob?: Blob
  metadata?: any
}

const props = defineProps<{
  streams: Stream[]
}>()

const emit = defineEmits<{
  cancel: [streamId: string]
  dismiss: [streamId: string]
  download: [stream: Stream]
}>()

const handleCancel = (streamId: string) => {
  emit('cancel', streamId)
}

const handleDismiss = (streamId: string) => {
  emit('dismiss', streamId)
}

const handleDownload = (streamId: string) => {
  const stream = props.streams.find(s => s.streamId === streamId)
  if (stream) {
    emit('download', stream)
  }
}
</script>

<style scoped>
.stream-container {
  width: 100%;
}

.streams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
