require('dotenv').config();

const initDb = async () => {
    const mongoClient = require('mongodb').MongoClient;
    let client;
    let db;

    try {
        client = await mongoClient.connect(process.env.APPLICATION_MONGODB_URL);

        db = client.db(process.env.MONGODB_NAME);
    } catch (err) {
        console.error(err);
    }

    await db.createCollection('SCRAPE_OPTIONS');
    await db.createCollection('BATCHES');
    await db.createCollection('SCRAPES');

    return db;
}

const initHttpListener = (database) => {
    const express = require('express');
    const app = express();
    const apiRouter = express.Router();
    const pageRouter = express.Router();
    const bodyParser = require('body-parser');
    const router = require('./router');
    const path = require('path');

    if (!database) {
        console.log('Cannot run without database');
        return;
    }
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());

    router.configurePages({ router: pageRouter });
    router.configureApi({ router: apiRouter, database });

    app.use(express.static(path.join(__dirname, 'client', 'build')))
    app.use('/', pageRouter);

    app.use('/api', apiRouter);

    const server = app.listen(parseInt(process.env.PORT), 'localhost', () =>
        console.log(`App is listening at http://${server.address().address}:${server.address().port}`));
}

try {
    initDb().then((database) => {
        initHttpListener(database);
    });
} catch (err) {
    if (err) {
        console.log('API startup failed: ', err);
        process.exit(1);
    }
}
