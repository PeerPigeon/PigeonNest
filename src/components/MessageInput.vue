<template>
  <div class="message-input-wrapper">
    <textarea
      :value="message"
      @input="message = ($event.target as HTMLTextAreaElement).value"
      placeholder="Type your message here..."
      rows="4"
      class="input-textarea"
    ></textarea>
    <button
      @click="sendMessage"
      class="send-btn"
      type="button"
      :disabled="!message.trim() || disabled"
    >
      📤 Send Message
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
}>()

const message = ref('')

const sendMessage = () => {
  const text = message.value.trim()
  if (text && !false) {
    emit('send', text)
    message.value = ''
  }
}
</script>

<style scoped>
.message-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border: 3px solid #1976d2;
  border-radius: 8px;
  margin-top: 20px;
  position: relative;
  z-index: 100;
}

.input-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #1976d2;
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.input-textarea:focus {
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
}

.send-btn:hover:not(:disabled) {
  background: #1565c0;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
