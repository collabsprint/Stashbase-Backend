const app = require('./app');
const db = require('./models/index');
require('dotenv').config();


const port = process.env.PORT;

app.listen(port, () => {
    db.sequelize.sync();
    console.log(`Server started on ${port}`)
})