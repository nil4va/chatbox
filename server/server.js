const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`PAD Framework app listening on port ${port}!`))
