<template>
  <div class="hub-connection">
    <div class="control-group">
      <label>Network Namespace</label>
      <input 
        :value="networkName"
        @input="handleNetworkNameInput"
        type="text" 
        placeholder="my-app-network"
      />
    </div>
    <div class="control-group">
      <label>Signaling Server URL</label>
      <input 
        :value="hubUrl"
        @input="handleInput"
        type="text" 
        placeholder="wss://pigeonhub.fly.dev"
      />
    </div>
    <div class="button-group">
      <button 
        class="primary" 
        @click="$emit('initialize')" 
        :disabled="isInitialized"
      >
        Initialize
      </button>
      <button 
        class="primary" 
        @click="$emit('connect')" 
        :disabled="!isInitialized || isConnected"
      >
        Connect
      </button>
      <button 
        class="secondary" 
        @click="$emit('disconnect')" 
        :disabled="!isConnected"
      >
        Disconnect
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  hubUrl: string
  networkName: string
  isInitialized: boolean
  isConnected: boolean
}>()

const emit = defineEmits<{
  'update:hubUrl': [value: string]
  'update:networkName': [value: string]
  initialize: []
  connect: []
  disconnect: []
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:hubUrl', target.value)
}

const handleNetworkNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:networkName', target.value)
}
</script>

<style scoped>
.hub-connection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  margin-bottom: 0;
}

.control-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 100px;
}

button.primary {
  background: #1976d2;
  color: white;
}

button.primary:hover:not(:disabled) {
  background: #1565c0;
}

button.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

button.secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

button.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
