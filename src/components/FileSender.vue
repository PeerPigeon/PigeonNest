<template>
  <div class="file-sender">
    <!-- Target Selection -->
    <div class="target-section">
      <label class="label">Send To:</label>
      <select v-model="selectedTarget" class="target-select">
        <option value="">Choose target...</option>
        <option value="__broadcast__">📢 Broadcast to All Peers</option>
        <option v-for="peer in peers" :key="peer" :value="peer">
          {{ formatPeerId(peer) }}
        </option>
      </select>
    </div>

    <!-- Drop Zone -->
    <div 
      class="drop-zone"
      :class="{ 'drop-zone-active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="drop-zone-content">
        <div class="drop-icon">📁</div>
        <p class="drop-text">Drag & drop files here</p>
        <p class="drop-hint">or</p>
        <button type="button" class="select-button" @click="openFileDialog">
          Select Files
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        multiple
        style="display: none"
        @change="handleFileInput"
      />
    </div>

    <!-- Selected Files List -->
    <div v-if="files.length > 0" class="files-list">
      <div class="files-header">
        <span>Selected Files ({{ files.length }})</span>
        <button type="button" class="clear-all-button" @click="clearAllFiles">
          Clear All
        </button>
      </div>
      <div class="file-item" v-for="(file, index) in files" :key="index">
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatSize(file.size) }}</div>
        </div>
        <button type="button" class="remove-button" @click="removeFile(index)">
          ✕
        </button>
      </div>
    </div>

    <!-- Send Button -->
    <button
      v-if="files.length > 0"
      type="button"
      class="send-button"
      :disabled="!selectedTarget || selectedTarget === ''"
      @click="sendFiles"
    >
      Send {{ files.length }} File{{ files.length > 1 ? 's' : '' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FileSenderProps {
  peers?: string[]
}

const props = withDefaults(defineProps<FileSenderProps>(), {
  peers: () => []
})

const emit = defineEmits<{
  send: [files: File[], target: string | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const selectedTarget = ref<string>('')
const isDragging = ref(false)

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    files.value.push(...Array.from(input.files))
    input.value = ''
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    files.value.push(...Array.from(event.dataTransfer.files))
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const clearAllFiles = () => {
  files.value = []
}

const sendFiles = () => {
  if (!selectedTarget.value || selectedTarget.value === '') return
  
  const target = selectedTarget.value === '__broadcast__' ? null : selectedTarget.value
  emit('send', [...files.value], target)
  files.value = []
  selectedTarget.value = ''
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const formatPeerId = (peerId: string): string => {
  if (peerId.length <= 16) return peerId
  return `${peerId.substring(0, 8)}...${peerId.substring(peerId.length - 8)}`
}
</script>

<style scoped>
.file-sender {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.target-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.target-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.target-select:focus {
  outline: none;
  border-color: #007bff;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
}

.drop-zone-active {
  border-color: #007bff;
  background: #e7f3ff;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-icon {
  font-size: 48px;
}

.drop-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.drop-hint {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.select-button {
  padding: 10px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.select-button:hover {
  background: #0056b3;
}

.files-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 14px;
}

.clear-all-button {
  padding: 4px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.clear-all-button:hover {
  background: #c82333;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.remove-button {
  padding: 4px 8px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.remove-button:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.send-button {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #218838;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
