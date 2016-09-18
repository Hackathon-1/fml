import styles from './styles'
import encoder from 'wav-encoder'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { action, observable } from 'mobx'
import { getEmotion, dispatchBuffers } from '../api'

navigator.getUserMedia =
  navigator.getUserMedia
  || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia
  || navigator.msGetUserMedia

@observer
export default class App extends Component {
  interval
  recording = false
  recordingLength = 0
  @observable videoURL = ''
  @observable videoLoaded = false

  componentDidMount() {
    this.width = 320
    this.video = document.getElementById('v')
    this.canvas = document.getElementById('c')

    // Create the webcam feed
    navigator.getUserMedia(
      { video: true, audio: true },
      (stream) => {
        this.buffers = []
        this.video.src = window.URL.createObjectURL(stream)

        // Create the MediaStreamAudioSourceNode
        const context = new AudioContext()
        const node = context.createScriptProcessor(1024, 1, 1)
        const source = context.createMediaStreamSource(stream)

        source.connect(node)
        node.connect(context.destination)
        node.onaudioprocess = ({ inputBuffer }) => {
          if (!this.recording) return
          const buffer = inputBuffer.getChannelData(0)
          this.buffers.push(buffer)
          this.recordingLength += buffer.length
        }
      },
      () => console.log('error')
    )

    this.video.addEventListener('canplay', () => {
      // Tweak to get the proper image captured
      this.height = this.video.videoHeight / (this.video.videoWidth / this.width)
      this.video.setAttribute('width', this.width)
      this.video.setAttribute('height', this.height)
      this.canvas.setAttribute('width', this.width)
      this.canvas.setAttribute('height', this.height)
    })
  }

  @action loadVideo = (e) => {
    e.preventDefault()
    this.recording = true
    this.videoLoaded = true
    this.interval = setInterval(() => {
      this.getImage()

      const buffers = this.mergeBuffers(this.buffers.slice())
      encoder.encode({ sampleRate: 44100, channelData: [buffers] })
        .then(dispatchBuffers)
        .then(console.log)

      this.buffers = []
      this.recording = true
      this.recordingLength = 0
    }, 4000)
  }

  @action updateURL = (e) => {
    if (this.videoLoaded) {
      this.recording = false
      this.videoLoaded = false
      clearInterval(this.interval)
    }
    this.videoURL = e.target.value
  }

  @action getImage = () => {
    this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.width, this.height)
    const image = this.canvas.toDataURL('image/octet-stream')
    getEmotion(image).then(x => x.map(y => console.log(y.scores)))
  }

  mergeBuffers(buffers) {
    let offset = 0
    const result = new Float32Array(this.recordingLength)
    for (let i = 0; i < buffers.length; i++) {
      result.set(buffers[i], offset)
      offset += buffers[i].length
    }
    return result
  }

  render() {
    return (
      <div>
        <Tracking />
        <header className="ui horizontal divider">Interact</header>
        <main className={classNames('ui container', styles.flex, styles.fadeIn)}>
          <form onSubmit={this.loadVideo} style={{ marginBottom: 10, width: '50%' }} className="ui icon fluid input">
            <input placeholder="Video URL" onInput={this.updateURL} />
            <i onClick={this.loadVideo} className="inverted circular search link icon" />
          </form>
          <Video videoLoaded={this.videoLoaded} src={this.videoURL.replace('watch?v=', 'v/')} />
        </main>
      </div>
    )
  }
}

const Video = observer(({ videoLoaded, src }) =>
  <div className={styles.flex}>
    {!videoLoaded
      ? <img className="ui large image bordered" src="http://semantic-ui.com/images/wireframe/white-image.png" />
      : <iframe width="560" height="315" src={src} frameBorder="0" allowFullScreen />
    }
  </div>
)

function Tracking() {
  return (
    <div className={styles.hidden}>
      <video id="v" autoPlay="true" muted />
      <canvas id="c" />
    </div>
  )
}
