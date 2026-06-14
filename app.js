const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('EventHub API'));

app.listen(3000, () => console.log('Server on 3000'));
