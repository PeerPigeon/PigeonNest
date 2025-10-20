import { ref, onUnmounted, Ref } from 'vue'
import type { PeerPigeonMesh } from 'peerpigeon'
import type { StreamEvent, StreamProgressEvent, StreamMetadata } from '../types'

export interface UsePeerStreamingReturn {
  activeStreams: Ref<Map<string, StreamProgress>>
  incomingStream: Ref<StreamEvent | null>
  sendFile: (mesh: PeerPigeonMesh, peerId: string, file: File) => Promise<void>
  sendBlob: (mesh: PeerPigeonMesh, peerId: string, blob: Blob, options?: Partial<StreamMetadata>) => Promise<void>
  sendStream: (mesh: PeerPigeonMesh, peerId: string, stream: ReadableStream<Uint8Array>, options?: Partial<StreamMetadata>) => Promise<void>
  createStreamToPeer: (mesh: PeerPigeonMesh, peerId: string, options?: Partial<StreamMetadata>) => WritableStream<Uint8Array>
  receiveStream: (event: StreamEvent) => Promise<Blob>
  cancelStream: (streamId: string) => void
}

export interface StreamProgress {
  streamId: string
  peerId: string
  filename: string
  totalSize: number
  bytesTransferred: number
  progress: number
  status: 'pending' | 'active' | 'completed' | 'error' | 'cancelled'
  error?: Error
}

export function usePeerStreaming(): UsePeerStreamingReturn {
  const activeStreams = ref<Map<string, StreamProgress>>(new Map())
  const incomingStream = ref<StreamEvent | null>(null)
  const streamControllers = new Map<string, AbortController>()

  const updateStreamProgress = (streamId: string, updates: Partial<StreamProgress>) => {
    const stream = activeStreams.value.get(streamId)
    if (stream) {
      activeStreams.value.set(streamId, { ...stream, ...updates })
      // Trigger reactivity
      activeStreams.value = new Map(activeStreams.value)
    }
  }

  const sendFile = async (mesh: PeerPigeonMesh, peerId: string, file: File): Promise<void> => {
    const streamId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const controller = new AbortController()
    streamControllers.set(streamId, controller)

    activeStreams.value.set(streamId, {
      streamId,
      peerId,
      filename: file.name,
      totalSize: file.size,
      bytesTransferred: 0,
      progress: 0,
      status: 'pending'
    })
    // Trigger reactivity
    activeStreams.value = new Map(activeStreams.value)

    try {
      updateStreamProgress(streamId, { status: 'active' })

      // Set up progress tracking
      const progressHandler = (event: any) => {
        if (event.streamId === streamId) {
          updateStreamProgress(streamId, {
            bytesTransferred: event.bytesTransferred,
            progress: event.progress
          })
        }
      }

      mesh.addEventListener('streamProgress', progressHandler)

      await mesh.sendFile(peerId, file)

      updateStreamProgress(streamId, {
        status: 'completed',
        progress: 100,
        bytesTransferred: file.size
      })

      mesh.removeEventListener('streamProgress', progressHandler)
    } catch (error) {
      updateStreamProgress(streamId, {
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
      throw error
    } finally {
      streamControllers.delete(streamId)
    }
  }

  const sendBlob = async (
    mesh: PeerPigeonMesh,
    peerId: string,
    blob: Blob,
    options: Partial<StreamMetadata> = {}
  ): Promise<void> => {
    const streamId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const controller = new AbortController()
    streamControllers.set(streamId, controller)

    const filename = options.filename || 'blob'
    const totalSize = blob.size

    activeStreams.value.set(streamId, {
      streamId,
      peerId,
      filename,
      totalSize,
      bytesTransferred: 0,
      progress: 0,
      status: 'pending'
    })
    // Trigger reactivity
    activeStreams.value = new Map(activeStreams.value)

    try {
      updateStreamProgress(streamId, { status: 'active' })

      const progressHandler = (event: any) => {
        if (event.streamId === streamId) {
          updateStreamProgress(streamId, {
            bytesTransferred: event.bytesTransferred,
            progress: event.progress
          })
        }
      }

      mesh.addEventListener('streamProgress', progressHandler)

      await mesh.sendBlob(peerId, blob, options)

      updateStreamProgress(streamId, {
        status: 'completed',
        progress: 100,
        bytesTransferred: totalSize
      })

      mesh.removeEventListener('streamProgress', progressHandler)
    } catch (error) {
      updateStreamProgress(streamId, {
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
      throw error
    } finally {
      streamControllers.delete(streamId)
    }
  }

  const receiveStream = async (event: StreamEvent): Promise<Blob> => {
    const { streamId, stream, metadata } = event
    
    if (!stream) {
      throw new Error('No stream provided')
    }

    const streamProgress: StreamProgress = {
      streamId,
      peerId: event.peerId,
      filename: metadata.filename,
      totalSize: metadata.totalSize,
      bytesTransferred: 0,
      progress: 0,
      status: 'active'
    }

    activeStreams.value.set(streamId, streamProgress)
    // Trigger reactivity
    activeStreams.value = new Map(activeStreams.value)

    try {
      const chunks: Uint8Array[] = []
      const reader = stream.getReader()
      let bytesReceived = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        bytesReceived += value.length

        const progress = metadata.totalSize > 0 
          ? (bytesReceived / metadata.totalSize) * 100 
          : 0

        updateStreamProgress(streamId, {
          bytesTransferred: bytesReceived,
          progress
        })
      }

      updateStreamProgress(streamId, {
        status: 'completed',
        progress: 100
      })

      return new Blob(chunks, { type: metadata.mimeType })
    } catch (error) {
      updateStreamProgress(streamId, {
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
      throw error
    }
  }

  const cancelStream = (streamId: string) => {
    const controller = streamControllers.get(streamId)
    if (controller) {
      controller.abort()
      streamControllers.delete(streamId)
    }
    updateStreamProgress(streamId, { status: 'cancelled' })
  }

  const sendStream = async (
    mesh: PeerPigeonMesh,
    peerId: string,
    stream: ReadableStream<Uint8Array>,
    options: Partial<StreamMetadata> = {}
  ): Promise<void> => {
    const streamId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const controller = new AbortController()
    streamControllers.set(streamId, controller)

    const filename = options.filename || 'stream'
    const totalSize = options.totalSize || 0

    activeStreams.value.set(streamId, {
      streamId,
      peerId,
      filename,
      totalSize,
      bytesTransferred: 0,
      progress: 0,
      status: 'pending'
    })
    // Trigger reactivity
    activeStreams.value = new Map(activeStreams.value)

    try {
      updateStreamProgress(streamId, { status: 'active' })

      const progressHandler = (event: any) => {
        if (event.streamId === streamId) {
          updateStreamProgress(streamId, {
            bytesTransferred: event.bytesTransferred,
            progress: event.progress
          })
        }
      }

      mesh.addEventListener('streamProgress', progressHandler)

      await mesh.sendStream(peerId, stream, options)

      updateStreamProgress(streamId, {
        status: 'completed',
        progress: 100,
        bytesTransferred: totalSize
      })

      mesh.removeEventListener('streamProgress', progressHandler)
    } catch (error) {
      updateStreamProgress(streamId, {
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
      throw error
    } finally {
      streamControllers.delete(streamId)
    }
  }

  const createStreamToPeer = (
    mesh: PeerPigeonMesh,
    peerId: string,
    options: Partial<StreamMetadata> = {}
  ): WritableStream<Uint8Array> => {
    return mesh.createStreamToPeer(peerId, options)
  }

  onUnmounted(() => {
    // Cancel all active streams
    streamControllers.forEach(controller => controller.abort())
    streamControllers.clear()
  })

  return {
    activeStreams,
    incomingStream,
    sendFile,
    sendBlob,
    sendStream,
    createStreamToPeer,
    receiveStream,
    cancelStream
  }
}
