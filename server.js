var WebSocketServer = require('websocket').server;
var http = require('http');
const util = require('util');
const { v4: uuidv4 } = require('uuid');


// REFACTORED -------------

// Express server
var express = require('express');
var app = express();
require('dotenv').config({
    path: "./.env/.env"
});

app.use(express.json());


app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // This will allow all origins
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

    // Allow preflight for all origins
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// TEST
app.use("/", function (req, res, next) {
    console.log("Request: " + req.url);
    next();
});

const agent_api = require('./src/routes/agent');

app.use('/agent', agent_api);

// // Joffrey Php redirection to local php server at port 3100
// var proxy = require('express-http-proxy');
// app.use("/joff", proxy("http://127.0.0.1:3100"));

if(process.env.USE_DATABASE === "TRUE") {
    // Init Databases
    const initDb = require('./src/db/init-db');
    initDb().then(() => {
        console.log("Databases initialized");
        // TODO APP LISTEN SHOULD BE HERE IN CASE OF DATABASE ACCESS
    });
} else {
    console.log("Running without database");
    // TODO APP LISTEN SHOULD BE HERE IN CASE OF NO DATABASE ACCESS
}


// ------------------------

const basicAuth = require('express-basic-auth')

const {
    auth
} = require('google-auth-library');


const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();

const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

const {
    OpenAI,
} = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// WebSocket server
var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8140, function () {
    console.log((new Date()) + ' Websocket-Server is listening on port 8140');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept();
    console.log((new Date()) + ' Connection accepted.');
    connection.sendUTF("Hi client!");

    var client_id = connection.socket._peername.address + ":" + connection.socket._peername.port;


    let recognizeStream = null;
    let canRecognize = false;

    function packChatMessage(message_id, message, done = false) {
        return JSON.stringify({
            message: "chat",
            contents: {
                message_id: message_id,
                delta: message,
                done: done
            }
        });
    }

    async function callChatGPT(connection, contents, retries = 0) {

        var max_tokens = 100;
        if (contents.maxtokens) {
            max_tokens = parseInt(contents.maxtokens);
        }

        var temperature = 0.35;
        if (contents.temperature) {
            temperature = parseFloat(contents.temperature);
        }

        var has_stops = false;
        var stop = "";
        if (contents.stop) {
            if (contents.stop != "") {
                stop = contents.stop;
                has_stops = true;
            }
        }

        let request = {
            model: contents.model,
            // prompt: text,
            max_tokens: max_tokens,
            temperature: temperature,
            frequency_penalty: 0.6,
            presence_penalty: 1.0,
            // top_p: 1,
        }

        if (contents.chat) {
            if (typeof contents.messages == "string") {
                request.messages = JSON.parse(contents.messages);
            } else if (typeof contents.messages == "object") {
                request.messages = contents.messages;
            } else {
                connection.sendUTF("Error: messages not found");
                return;
            }
            delete request.prompt;
        } else {
            // Not supported yet
            connection.sendUTF("Error: chat not found");
            return;
        }

        request.stream = true;

        if (has_stops) {
            request.stop = [stop];
        }

        let sendResultsOn = false;
        if (contents.sendResultsOn) {
            // Check if sendResultsOn is a string or an array, if string, every character is an entry in the array
            if (typeof contents.sendResultsOn == "string") {
                contents.sendResultsOn = contents.sendResultsOn.split("");
            }
            sendResultsOn = contents.sendResultsOn;
            // Looks like ["\n", ":", "?", "!", "."]
        }

        const message_id = contents.message_id;


        try {

            const completion = await openai.chat.completions.create(request, { responseType: "stream" });
            let temp_text = "";

            for await (const chunk of completion) {

                if (sendResultsOn) {
                    // Check if content ends on one of the entries in the sendResultsOn array
                    if (chunk.choices[0]?.delta?.content)
                        temp_text += chunk.choices[0]?.delta?.content;

                    if (contents.sendResultsOn.some(v => temp_text.endsWith(v))) {
                        console.log("NLP: " + temp_text);
                        connection.sendUTF(packChatMessage(message_id, temp_text));
                        temp_text = "";
                    }

                } else {
                    console.log(parsed.choices[0].delta.content);
                    connection.sendUTF(packChatMessage(message_id, chunk.choices[0]?.delta?.content));
                }
            }

            if (temp_text != "") {
                console.log("NLP: " + temp_text);
                connection.sendUTF(packChatMessage(message_id, temp_text, true));
                temp_text = "";
            } else {
                connection.sendUTF(packChatMessage(message_id, '', true));
            }
            console.log('Stream finished');

        } catch (error) {
            console.log(`Error, retrying ${retries} ` + error.message);

            if (retries >= 5) {
                connection.sendUTF("Error: " + error.message);
                return;
            }
            // Retry after 1 second
            setTimeout(function () {
                callChatGPT(connection, contents, retries + 1);
            }
                , 1000);
        }
    }

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            try {
                var json = JSON.parse(message.utf8Data);
                switch (json.message) {
                    // For GPT
                    case "chat-gpt":
                        callChatGPT(connection, json.contents);
                        break;
                    case 'Hello':
                        console.log('Sending Hello');
                        break;
                    // For STT
                    case "start-audio":
                        console.log("Start Recognition with SampleHZ: " + json.contents.sampleRateHertz);

                        if (recognizeStream != null) {
                            recognizeStream.end();
                            recognizeStream = null;
                        }

                        let localSSTRequest = {
                            config: json.contents,
                            interimResults: true,
                        };

                        // Check if config contains a valid language code, if not, set it to en-US
                        if (localSSTRequest.config.languageCode == null) {
                            localSSTRequest.config.languageCode = "en-US";
                        }

                        // Check if a model is set, if not, set it to default
                        if (localSSTRequest.config.model == null) {
                            localSSTRequest.config.model = "latest_long";
                            localSSTRequest.config.useEnhanced = true;
                        }

                        recognizeStream = speechClient
                            .streamingRecognize(localSSTRequest)
                            .on('error', (err) => {
                                console.log("Error:" + err);
                                canRecognize = false;
                                if (recognizeStream != null) {
                                    recognizeStream.end();
                                    recognizeStream = null;
                                }
                                connection.sendUTF(`LanguageCodeError ${localSSTRequest.config.languageCode} not supported`)
                            })
                            .on('data', data => {
                                if (data.results[0] && data.results[0].alternatives[0]) {

                                    if (data.results[0].stability == 0) {
                                        data.results[0].stability = 0.1;
                                    }
                                    if (data.results[0].isFinal) {
                                        console.log("STT:" + JSON.stringify(data.results[0].alternatives[0].transcript));
                                        // db store stt

                                        canRecognize = false;
                                        if (recognizeStream != null) {
                                            recognizeStream.end();
                                            recognizeStream = null;
                                        }
                                    }

                                    let response = {
                                        message: "stt",
                                        contents: data.results[0]
                                    };
                                    connection.sendUTF(JSON.stringify(response));
                                }
                            })
                            .on('end', () => {
                                console.log("End Recognition");
                            });
                        canRecognize = true;
                        break;
                    case "stop-audio":
                        console.log("Stop Recognition");
                        if (recognizeStream != null) {
                            recognizeStream.end();
                            recognizeStream = null;
                        }
                        canRecognize = false;
                        break;

                }
            } catch (e) {
                console.log("not JSON");
            }
        } else if (message.type === 'binary') {

            if (recognizeStream != null && recognizeStream.writable && canRecognize) {
                recognizeStream.write(message.binaryData);
            }

        }
    });

    connection.on('close', function (reasonCode, description) {
        if (recognizeStream != null) {
            recognizeStream.end();
        }
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function stringToNodeBuffer(str) {
    return Buffer.from(str, 'utf8');
}


app.listen(8150, function () {
    console.log('Example app listening on port 8150!');
});

