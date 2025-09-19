require('dotenv').config({
    path: "./.env/.env"
});

const fs = require('fs');

const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const {
    OpenAI,
} = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const DATA = require("./demo-gesche/data.json");

async function CreateDemoAudio() {
    
    var audioInOrder = [];

    data = DATA.all_requests;
    // console.log(data);

    data = data.filter(v => (v.request_type === "tts" || v.request_type === "stt"));

    

    for(var i = 0; i < data.length; i++) {
        var v = data[i];
        if(v.request_type === "tts") {
            console.log(`Copying agent reponse to ./demo-gesche/audio/${i}_agent.mp3`)
            fs.copyFileSync(`${v.response}`, `./demo-gesche/audio/${i}_agent.mp3`);
            audioInOrder.push(["agent", v.response]);
        }else if(v.request_type === "stt"){
            console.log(`Creating user reponse to ./demo-gesche/audio/${i}_user.mp3`)
            console.log(v.response);
            await CreateAudioFile(v.response, "echo", `./demo-gesche/audio/${i}_user.mp3`);
            audioInOrder.push(["user", v.response]);
        }
    }
}

async function CreateAudioFile(text, voice, filename) {

    const request = {
        model: "tts-1",
        voice: voice,
        input: text
    };

    console.log(request);

    try {
        const mp3 = await openai.audio.speech.create(request);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const outputFile = filename;
        await writeFileAsync(outputFile, buffer);
    } catch (err) {
        console.log(err);
        process.exit(0);
    }
}

CreateDemoAudio();