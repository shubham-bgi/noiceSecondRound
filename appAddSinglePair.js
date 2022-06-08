/**
 * Program accepting only one key value pair at a time.
 * Accepted body in post request is as:
 * { "key" : "any_key", "value" : "any_value"}
 */

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const MAX_LENGTH = 2;
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let pairs = {};
let toReplace = {};

function updateReplace(key) {
    toReplace = { ...pairs[key] };
    toReplace.key = key;
};

function addPair(key, value) {
    pairs[key] = {};
    pairs[key].value = value;
    pairs[key].lastRequested = new Date();
    pairs[key].count = 0;
};

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

    if (Object.keys(pairs).length < MAX_LENGTH) {
        addPair(body.key, body.value);
        return res.status(201).json(pairs);
    }

    updateReplace(Object.keys(pairs)[0]);
    for (let key in pairs) {
        if (toReplace.count > pairs[key].count) {
            updateReplace(key);
        } else if (toReplace.count === pairs[key].count && toReplace.lastRequested.getTime() > pairs[key].lastRequested.getTime()) {
            updateReplace(key);
        }
    }
    delete pairs[toReplace.key];
    addPair(body.key, body.value);

    return res.status(201).json(pairs);
});

app.listen(PORT, () => {
    console.log(`Listening at port localhost:${PORT}`);
});