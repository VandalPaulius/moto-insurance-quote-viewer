const getBatches = async ({ database, req, res, next }) => {
    const batchIds = await database
        .collection('BATCHES')
        .find({})
        .sort({ startedAt: -1 })
        .toArray();

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(batchIds));
    res.end();
};

const getScrapes = async ({ database, req, res, next }) => {
    if (!req.params && req.params.batchId) {
        res.status(400)
        res.write('Error: batchId not found');
        res.end();
        return;
    }

    const scrapes = await database
        .collection('SCRAPES')
        .find({ batchId: req.params.batchId })
        .sort({ startedAt: -1 })
        .toArray();

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(scrapes));
    res.end();
};

exports.configure = ({ router, database }) => {
    router
        .route('/scrapes')
        .get(async (req, res, next) => await getBatches({ database, req, res, next }))

    router
        .route('/scrapes/:batchId/quotes')
        .get(async (req, res, next) => await getScrapes({ database, req, res, next }))
};
