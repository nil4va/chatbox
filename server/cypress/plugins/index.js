const express = require('express')
const app = express()

app.use(express.static('../src'))
app.listen(8081)

console.log('Server running on port 8081')

module.exports = (on, config) => {}
