import app from './app';
import db from './models';
import 'dotenv/config';

const port: string | number = process.env.PORT || 3000;

app.listen(port, () => {
    db.sequelize.sync();
    console.log(`Server started on ${port}`);
});
