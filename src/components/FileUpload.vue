<template>
  <div class="file-upload">
    <div class="upload-area" :class="{ 'drag-over': isDragOver }">
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept"
        @change="handleFileSelect"
        class="file-input"
      />
      
      <div
        class="upload-dropzone"
        @click="openFileDialog"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <div class="upload-icon">📁</div>
        <div class="upload-text">
          <p class="primary">{{ primaryText }}</p>
          <p class="secondary">{{ secondaryText }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="selectedFiles.length > 0" class="file-list">
      <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
        </div>
        <button @click="removeFile(index)" class="remove-btn" title="Remove">
          ❌
        </button>
      </div>
    </div>
    
    <div v-if="selectedFiles.length > 0 && targetPeerId" class="upload-actions">
      <button @click="uploadFiles" :disabled="uploading" class="upload-btn">
        {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}` }}
      </button>
      <button @click="clearFiles" :disabled="uploading" class="clear-btn">
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FileUploadProps {
  multiple?: boolean
  accept?: string
  targetPeerId?: string
  primaryText?: string
  secondaryText?: string
}

const props = withDefaults(defineProps<FileUploadProps>(), {
  multiple: true,
  accept: '*',
  primaryText: 'Click to select files or drag and drop',
  secondaryText: 'Choose files to send to peer'
})

const emit = defineEmits<{
  upload: [files: File[]]
  change: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const isDragOver = ref(false)
const uploading = ref(false)

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  if (props.multiple) {
    selectedFiles.value.push(...files)
  } else {
    selectedFiles.value = [files[0]]
  }
  emit('change', selectedFiles.value)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  emit('change', selectedFiles.value)
}

const clearFiles = () => {
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('change', selectedFiles.value)
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return
  uploading.value = true
  try {
    emit('upload', selectedFiles.value)
  } finally {
    uploading.value = false
  }
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
.file-upload {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.upload-area {
  position: relative;
}

.file-input {
  display: none;
}

.upload-dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-dropzone:hover,
.upload-area.drag-over .upload-dropzone {
  border-color: #1976d2;
  background: #f5f9ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text .primary {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.upload-text .secondary {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.file-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.remove-btn:hover {
  opacity: 1;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.upload-btn,
.clear-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn {
  background: #1976d2;
  color: white;
}

.upload-btn:hover:not(:disabled) {
  background: #1565c0;
}

.upload-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.clear-btn:hover:not(:disabled) {
  background: #e0e0e0;
}
</style>
