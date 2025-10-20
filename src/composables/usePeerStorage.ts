import { ref, Ref } from 'vue'
import type { PeerPigeonMesh } from 'peerpigeon'
import type { StorageEntry } from '../types'

export interface UsePeerStorageReturn {
  entries: Ref<Map<string, StorageEntry>>
  loading: Ref<boolean>
  error: Ref<Error | null>
  set: (mesh: PeerPigeonMesh, key: string, value: any, ttl?: number) => Promise<void>
  get: (mesh: PeerPigeonMesh, key: string) => Promise<any>
  has: (mesh: PeerPigeonMesh, key: string) => Promise<boolean>
  delete: (mesh: PeerPigeonMesh, key: string) => Promise<void>
  clear: (mesh: PeerPigeonMesh) => Promise<void>
  list: (mesh: PeerPigeonMesh) => Promise<string[]>
  refreshEntries: (mesh: PeerPigeonMesh) => Promise<void>
}

export function usePeerStorage(): UsePeerStorageReturn {
  const entries = ref<Map<string, StorageEntry>>(new Map())
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const set = async (mesh: PeerPigeonMesh, key: string, value: any, ttl?: number): Promise<void> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      await mesh.storage.set(key, value, ttl)

      // Update local entries
      entries.value.set(key, {
        key,
        value,
        timestamp: Date.now(),
        ttl
      })
      // Trigger reactivity
      entries.value = new Map(entries.value)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const get = async (mesh: PeerPigeonMesh, key: string): Promise<any> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      const value = await mesh.storage.get(key)
      
      if (value !== null && value !== undefined) {
        entries.value.set(key, {
          key,
          value,
          timestamp: Date.now()
        })
        // Trigger reactivity
        entries.value = new Map(entries.value)
      }

      return value
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const has = async (mesh: PeerPigeonMesh, key: string): Promise<boolean> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      return await mesh.storage.has(key)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteKey = async (mesh: PeerPigeonMesh, key: string): Promise<void> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      await mesh.storage.delete(key)
      entries.value.delete(key)
      // Trigger reactivity
      entries.value = new Map(entries.value)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const clear = async (mesh: PeerPigeonMesh): Promise<void> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      await mesh.storage.clear()
      entries.value.clear()
      // Trigger reactivity
      entries.value = new Map(entries.value)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const list = async (mesh: PeerPigeonMesh): Promise<string[]> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      const keys = await mesh.storage.keys()
      return Array.isArray(keys) ? keys : []
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshEntries = async (mesh: PeerPigeonMesh): Promise<void> => {
    try {
      error.value = null
      loading.value = true

      if (!mesh.storage) {
        throw new Error('Storage not available on mesh')
      }

      const keys = await mesh.storage.keys()
      const newEntries = new Map<string, StorageEntry>()

      for (const key of keys) {
        const value = await mesh.storage.get(key)
        newEntries.set(key, {
          key,
          value,
          timestamp: Date.now()
        })
      }

      entries.value = newEntries
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    loading,
    error,
    set,
    get,
    has,
    delete: deleteKey,
    clear,
    list,
    refreshEntries
  }
}
