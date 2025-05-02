require('dotenv').config();
const express = require('express');
const app = express();
const billsRouter = require('./routes/bills');
const ordersRouter = require('./routes/orders');
const reportsRouter = require('./routes/reports');
const menuRouter = require('./routes/menu');
const sequelize = require('./sequelize'); // your sequelize instance
const cors = require('cors'); 

app.use(express.json());
app.use(cors());
app.use('/orders', ordersRouter);
app.use('/bills', billsRouter);
app.use('/menu', menuRouter);
app.use('/reports', reportsRouter);

// Sync models with the database
sequelize.sync({ alter: true }) // alter: true will update the tables if they are not in sync with models
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => {
    console.log('Error syncing database: ', err);
  });

app.listen(3002, () => console.log('Server running on port 3002'));
