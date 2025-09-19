const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

const pool = require('../config/database-pg');
const { v4: uuidv4 } = require('uuid');

var fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

async function MakeTTSApiCall_GOOGLE(options) {
    console.log("TTS-GOOGLE:" + options.text);

    const request = {
        input: {
            text: options.text
        },
        voice: {
            languageCode: options.languageCode,
            "name": options.languageCode == "en-US" ? "en-US-Wavenet-B" : "de-DE-Neural2-C",
        },
        audioConfig: {
            audioEncoding: 'MP3',
            pitch: -1.8,
            speakingRate: 1.07
        },
    };

    if (options.voice) {
        request.voice.name = req.query.voice;
    }
    const [response] = await client.synthesizeSpeech(request);
    const outputFile = "audio/" + uuidv4() + ".mp3";
    // const writeFile = util.promisify(fs.writeFile);
    await writeFileAsync(outputFile, response.audioContent, 'binary');
    // await writeFile(outputFile, response.audioContent, 'binary');

    if(process.env.USE_DATABASE === 'TRUE') {
        await pool.query("INSERT INTO all_requests (request_type, request, response, session_id) VALUES ($1, $2, $3, $4)", ["tts", options.text, outputFile, ""]);
    }

    return outputFile;
}

module.exports = {
    MakeTTSApiCall_GOOGLE
};