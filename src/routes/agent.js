var express = require('express');
var router = express.Router();
const { processNLPRequest, translateText, MakeTTSApiCall_OpenAI } = require('../services/openai');
const {MakeTTSApiCall_GOOGLE} = require('../services/google');
const {retrieveAudioFile} = require('../services/audiofileservice');

// Auth middleware
router.use(function (req, res, next) {
    console.log('Auth middleware');
    let key = req.query.key || req.body.key;
    if (key && key == process.env.API_KEY) {
        // await MakeTTSApiCall(req, res);
        console.log('API Key is valid');
        return next();
    } else {
        console.log('API Key is invalid');
        res.status(401).send('Unauthorized');
    }
});

router.get('/', function (req, res, next) {
    res.send('Test 2');
});

router.get('/audio/:audiofile', async (req, res) => {
    
        const audiofile = req.params.audiofile;
        const filePath = `./audio/${audiofile}`;

        retrieveAudioFile(audiofile)
            .then((filePath) => {
                res.sendFile(filePath, { root: process.cwd() });
            })
            .catch((error) => {
                console.log("Error retrieving audio file:", filePath);
                console.error(error);
                res.status(404).send("Audio file not found");
            });
});

router.get('/tts-openai', async (req, res) => {
    // Add https://caolan.github.io/async/v3/docs.html#retry ??
    try{
        const options = {
            text: req.query.text,
            voice: req.query.voice,
            speed: req.query.speed
        };

        const outputFile = await MakeTTSApiCall_OpenAI(options);
        const uuid = outputFile.replace("audio/", "").replace(".mp3", "");
        res.setHeader('X-Audio-UUID', uuid); // <--- send UUID in response header
        res.sendFile(outputFile, { root: process.cwd()});
    } catch (error) {
        console.error("Error processing TTS request:", error);
        res.status(500).send("Error processing request");
    }
});

router.get('/tts-openai/path', async (req, res) => {
    try {
        const options = {
            text: req.query.text,
            voice: req.query.voice,
            speed: req.query.speed
        };

        const outputFile = await MakeTTSApiCall_OpenAI(options);
        const uuid = outputFile.replace("audio/", "").replace(".mp3", "");
        // Return the file path as JSON
        res.json({
            filePath: outputFile
        });
    } catch (error) {
        console.error("Error processing TTS request:", error);
        res.status(500).send("Error processing request");
    }
});


router.get('/tts-google', async (req, res) => {

    try{
        const options = {
            text: req.query.text,
            languageCode: req.query.languageCode,
            speed: req.query.speed,
            voice: req.query.voice
        };

        const outputFile = await MakeTTSApiCall_GOOGLE(options);
        const uuid = outputFile.replace("audio/", "").replace(".mp3", "");
        res.setHeader('X-Audio-UUID', uuid); // <--- send UUID in response header
        res.sendFile(outputFile, { root: process.cwd()});

    } catch (error) {
        console.error("Error processing TTS request:", error);
        res.status(500).send("Error processing request");
    }

    // if (req.query.key && req.query.key == process.env.API_KEY && req.query.text && req.query.languageCode) {
    //     await MakeTTSApiCall(req, res);
    // } else {
    //     res.send("Hello");
    // }
});

router.post('/nlp', async (req, res) => {
    try {

        console.log("NLP: " + req.body.messages[0].content.substring(0, 25) + "...");

        const options = {
            model: req.body.model,
            maxTokens: req.body.maxtokens,
            temperature: req.body.temperature,
            stop: req.body.stop,
            translate: req.body.translate,
            languageCode: req.body.languageCode,
            chat: req.body.chat,
            streamOn: req.body.streamOn,
            messages: typeof req.body.messages === 'string' ? JSON.parse(req.body.messages) : req.body.messages
        };
        
        const result = await processNLPRequest(options);

        // Translate the response if needed
        if (req.body.translate && req.body.languageCode && typeof result === 'object') {
            result.choices[0].text = await translateText(result.choices[0].text, req.body.languageCode);
        }

        res.json(result);
    } catch (error) {
        console.error("Error processing NLP request:", error);
        res.status(500).send("Error processing request");
    }
});

module.exports = router;