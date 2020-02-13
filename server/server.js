/**
 * Do not alter this
 */
const app = require('./app');

//TODO: set variable in .env - empty is local
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`PAD Framework app listening on port ${port}!`));
