const fs = require('fs')
const app = require('express')()

app.use(require('cors')())
app.use(require('body-parser').raw({ limit: '5mb' }))

app.post('/', (req, res) => {
  res.json({ success: true })
  fs.writeFileSync('noise.wav', new Buffer(req.body))
})

app.listen(3000)
