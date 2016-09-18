import InlineWorker from 'inline-worker'

export class Recorder {
  recording = false
  cbQueue = { export: [] }
  worker = new InlineWorker(createWorker)
  config = { numChannels: 2, bufferLen: 4096 }

  constructor(source) {
    const context = source.context
    const { numChannels, bufferLen } = this.config
    const node = context.createScriptProcessor(bufferLen, numChannels, numChannels)

    node.onaudioprocess = (e) => {
      if (!this.recording) return

      const buffer = []
      for (let channel = 0; channel < numChannels; channel++) {
        buffer.push(e.inputBuffer.getChannelData(channel))
      }

      this.worker.postMessage({ command: 'record', buffer })
    }

    source.connect(node)
    node.connect(context.destination)
    this.worker.postMessage({ command: 'init', numChannels })
    this.worker.onmessage = (e) => this.cbQueue[e.data.command].pop()(e.data.wav)
  }

  stop = () => this.recording = false
  record = () => this.recording = true
  clear = () => this.worker.postMessage({ command: 'clear' })

  exportWAV(cb, type = 'audio/wav') {
    if (!cb) throw new Error('Callback not set')

    this.cbQueue.export.unshift(cb)
    this.worker.postMessage({ command: 'export', type })
  }
}

function createWorker(self) {
  let recLength = 0
  let recBuffers = []
  const sampleRate = 44100

  self.onmessage = (e) => {
    switch (e.data.command) {
      case 'init':
        return init(e.data.numChannels, e.data.cbQueue)
      case 'record':
        return record(e.data.buffer)
      case 'export':
        return exportWAV(e.data.type)
      case 'clear':
        return clear()
      default: throw new Error('Unexpected Command')
    }
  }

  function record(inputBuffer) {
    for (let channel = 0; channel < self.numChannels; channel++) {
      recBuffers[channel].push(inputBuffer[channel])
    }
    recLength += inputBuffer[0].length
  }

  function init(numChannels) {
    self.numChannels = numChannels
    createChannels()
  }

  function clear() {
    recLength = 0
    recBuffers = []
    createChannels()
  }

  function exportWAV(type) {
    const buffers = []

    for (let channel = 0; channel < self.numChannels; channel++) {
      buffers.push(mergeBuffers(recBuffers[channel], recLength))
    }

    const interleaved = self.numChannels === 2
      ? interleave(buffers[0], buffers[1])
      : buffers[0]

    self.postMessage({ command: 'export', wav: new Blob([encodeWAV(interleaved)], { type }) })
  }

  function encodeWAV(samples) {
    const view = new DataView(new ArrayBuffer(44 + samples.length * 2))
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, self.numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 4, true)
    view.setUint16(32, self.numChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, samples.length * 2, true)
    floatTo16BitPCM(view, 44, samples)
    return view
  }

  function createChannels() {
    for (let channel = 0; channel < self.numChannels; channel++) {
      recBuffers[channel] = []
    }
  }

  function mergeBuffers(buf, buflen) {
    let offset = 0
    const result = new Float32Array(buflen)

    for (let i = 0; i < buf.length; i++) {
      result.set(buf[i], offset)
      offset += buf[i].length
    }

    return result
  }

  function interleave(inputL, inputR) {
    const length = inputL.length + inputR.length
    const result = new Float32Array(length)

    let index = 0
    let inputIndex = 0

    while (index < length) {
      result[index++] = inputL[inputIndex]
      result[index++] = inputR[inputIndex]
      inputIndex++
    }

    return result
  }

  function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
}

export default Recorder
