const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/matieres', require('./routes/matieres'));
app.use('/api/palettes', require('./routes/palettes'));
app.use('/api/stock',    require('./routes/stock'));
app.use('/api/users',    require('./routes/users'));

app.listen(process.env.PORT, () => {
  console.log('Serveur démarré sur le port ' + process.env.PORT);
});