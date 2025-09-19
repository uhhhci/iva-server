const { OpenAI, } = require("openai");
const pool = require('../config/database-pg');
const { v4: uuidv4 } = require('uuid');

var fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processNLPRequest(options) {
    let text = options.input;
    if (options.translate && options.languageCode) {
        text = await translateText(options.input, "en"); // Assuming translation function exists
    }

    const request = {
        model: options.model,
        max_tokens: options.maxTokens || 100,
        temperature: options.temperature || 0.35,
        frequency_penalty: 0.6,
        presence_penalty: 1.0,
        stop: options.stop ? [options.stop] : undefined,
        stream: options.streamOn,
        messages: options.messages
    };

    if (options.chat && options.streamOn) {
        const completionStream = await openai.chat.completions.create(request, { responseType: "stream" });
        let tempText = "";
        for await (const chunk of completionStream) {
            tempText += chunk.choices[0]?.delta?.content || '';
        }
        return tempText;
    } else {
        const completion = await openai.chat.completions.create(request).catch(err => {
            console.log(err);
            throw new Error('Failed to create completion.');
        });
        return completion.choices[0].message.content;
    }
}

async function MakeTTSApiCall_OpenAI(options) {
    console.log("TTS-OAI:" + options.text);

    const request = {
        model: "tts-1",
        voice: options.voice,
        input: options.text,
        speed: options.speed || 1,
    };

    const mp3 = await openai.audio.speech.create(request);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const outputFile = "audio/" + uuidv4() + ".mp3";
    await writeFileAsync(outputFile, buffer);
    
    if(process.env.USE_DATABASE === 'TRUE'){
        await pool.query("INSERT INTO all_requests (request_type, request, response, session_id) VALUES ($1, $2, $3, $4)", ["tts", options.text, outputFile, ""]);
    }
    
    return outputFile;

}

async function translateText(input, targetLanguage) {
    // Translation logic here (You should implement or integrate an existing service.)
    return input; // Placeholder return
}

module.exports = {
    processNLPRequest,
    translateText,
    MakeTTSApiCall_OpenAI
};