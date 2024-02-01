const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const enemy = require('./routes/enemy');

const PORT = 3000;
const app = express();
app.use(express.json());

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));

app.use('/enemy', enemy);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});