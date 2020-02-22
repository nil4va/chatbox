/**
 * Do not change this - "main" entry point of the server
 * Add your server logic to app.js
 */
const app = require('./app');

//TODO: set variable in .env - empty is local
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`PAD Framework app listening on port ${port}!`));
