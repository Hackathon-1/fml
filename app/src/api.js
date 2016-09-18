import { makeblob } from './util'

export const getEmotion = (image) =>
  fetch('https://api.projectoxford.ai/emotion/v1.0/recognize', {
    method: 'POST',
    body: makeblob(image),
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': '9cde604b98ec4911a9ab0874ad64eedd'
    }
  }).then(toJSON)

export const dispatchBuffers = (buffers) =>
  fetch('http://localhost:3000', {
    method: 'POST',
    body: new Blob([buffers]),
    headers: {
      'Content-Type': 'audio/wav'
    }
  }).then(toJSON)

function toJSON(res) {
  return res.json()
}
