import styles from './styles'
import recorder from '../recorder'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { action, observable } from 'mobx'
import { getEmotion, dispatchWav, calculateEmotion } from '../api'

navigator.getUserMedia =
  navigator.getUserMedia
  || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia
  || navigator.msGetUserMedia

const happyExpected = {
  anger: 0.00300731952,
  contempt: 5.14648448E-08,
  disgust: 9.180124E-06,
  fear: 0.0001912825,
  happiness: 0.9875571,
  neutral: 0.0009861537,
  sadness: 1.889955E-05,
  surprise: 0.008229999
}

const sadExpected = {
  anger: 0.00300731952,
  contempt: 5.14648448E-08,
  disgust: 9.180124E-06,
  fear: 0.0001912825,
  happiness: 1.889955E-05,
  neutral: 0.0009861537,
  sadness: 0.9875571,
  surprise: 0.008229999
}

@observer
export default class App extends Component {
  interval
  @observable selectedVideo = null
  videos = [
    { title: 'Baby', id: 'L49VXZwfup8', src: 'https://www.youtube.com/embed/L49VXZwfup8?start=3&end=23', expected: happyExpected },
    { title: 'Dumb Lion', id: 'URGUQlcAoNU', src: 'https://www.youtube.com/embed/URGUQlcAoNU?start=58&end=90', expected: sadExpected },
    { title: 'Singer', id: 'PT2_F-1esPk', src: 'https://www.youtube.com/v/PT2_F-1esPk', expected: happyExpected },
    { title: 'Singing', id: 'kOkQ4T5WO9E', src: 'https://www.youtube.com/v/kOkQ4T5WO9E', expected: happyExpected },
    { title: 'A Song', id: 'UprcpdwuwCg', src: 'https://www.youtube.com/v/UprcpdwuwCg', expected: happyExpected },
    { title: 'Into Micro', id: '3AtDnEC4zak', src: 'https://www.youtube.com/v/3AtDnEC4zak', expected: happyExpected },
    { title: 'Phone', id: '3w0yqAdJ1iY', src: 'https://www.youtube.com/v/3w0yqAdJ1iY', expected: happyExpected }
  ]

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
        this.recorder = new recorder((new AudioContext()).createMediaStreamSource(stream))
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

  @action loadVideo = (i) => {
    this.selectedVideo = i
    this.recorder.record()
    this.interval = setInterval(() => {
      this.getImage(this.videos[i])
      this.recorder.exportWAV((wav) => dispatchWav(wav).then(console.log))
      this.recorder.clear()
    }, 4000)
  }

  @action getImage = ({ expected }) => {
    this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.width, this.height)
    const image = this.canvas.toDataURL('image/octet-stream')
    getEmotion(image)
      .then(x => x.map(y => y.scores))
      .then(x => calculateEmotion(x, expected))
  }

  @action killVideo = () => {
    this.recorder.stop()
    this.recorder.clear()
    this.selectedVideo = null
    clearInterval(this.interval)
  }

  render() {
    return (
      <div className="ui container">
        <Tracking />
        <header className="ui horizontal divider">Aria</header>
        <main className={styles.fadeIn}>
          <Video
            selectedVideo={this.selectedVideo}
            videos={this.videos}
            loadVideo={this.loadVideo}
            killVideo={this.killVideo}
          />
        </main>
      </div>
    )
  }
}

const Video = observer(function({ selectedVideo, videos, loadVideo, killVideo }) {
  switch (selectedVideo) {
    case null:
      return (
        <div className="ui four cards" >
        {videos.map((v, i) =>
          <div key={i} className="ui card">
            <div className="content">{v.title}</div>
            <div className="image">
              <img src={`http://img.youtube.com/vi/${v.id}/default.jpg`} />
            </div>
            <div className="content">
              <button onClick={() => loadVideo(i)} className="ui basic green button">Watch</button>
            </div>
          </div>
        )}
        </div>
      )
    default:
      return (
        <div className={styles.flex}>
          <button style={{ marginBottom: 20 }} onClick={() => killVideo()} className="ui basic red button">Back</button>
          <iframe width="800" height="600" src={videos[selectedVideo].src} frameBorder="0" allowFullScreen />
        </div>
      )
  }
})

function Tracking() {
  return (
    <div className={styles.hidden}>
      <video id="v" autoPlay="true" muted />
      <canvas id="c" />
    </div>
  )
}
