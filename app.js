const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const MAX_LENGTH = 5;
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let pairs = {};

app.get("/:key", (req, res) => {
    let key = req.params.key;
    if (!pairs[key]) return res.status(404).json({ "message": "key does not exist" });
    pairs[key].count++;
    pairs[key].lastRequested = new Date();
    return res.status(200).send(pairs[key].value);
});

app.post("/", (req, res) => {
    console.log(req.body);
    const body = req.body;
    const bodyLength = Object.keys(body).length;
    const pairsLength = Object.keys(pairs).length;
    if (bodyLength > MAX_LENGTH) return res.status(400).json({ "message": `length can not be greater than ${MAX_LENGTH}` });

    if (pairsLength === 0 || bodyLength === MAX_LENGTH) {
        pairs = { ...body };
        for (let key in pairs) addPair(key, body[key]);
        return res.status(201).json(pairs);
    }

    if (pairsLength < bodyLength) {
        while (pairsLength <= MAX_LENGTH && bodyLength > 0) {
            pairsLength++;
            bodyLength--;
            for (let key in body) {
                addPair(key, body[key]);
                delete body[key];
            }
        }
    }

    if(bodyLength === 0) return res.status(201).json(pairs);

    let sortable = [];
    for (let key in pairs) {
        sortable.push([key, pairs[key].count, pairs[key].lastRequested.getTime()]);
    }
    sortable.sort(function (a, b) {
        if (a[1] === b[1]) return a[2] - b[2];
        return a[1] - b[1];
    });

    let i = 0;
    for (let key in body) {
        delete pairs[sortable[i++][0]];
        addPair(key, body[key]);
    }

    return res.status(201).json(pairs);
})

function addPair(key, value) {
    pairs[key] = {};
    pairs[key].value = value;
    pairs[key].lastRequested = new Date();
    pairs[key].count = 0;
};

app.listen(PORT, () => {
    console.log(`Listening at port localhost:${PORT}`);
})