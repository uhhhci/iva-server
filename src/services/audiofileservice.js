const fs = require('fs');

function retrieveAudioFile(audiofile) {
    return new Promise((resolve, reject) => {
        const filePath = `./audio/${audiofile}`;
        // print current working directory
       // console.log("Current working directory:", process.cwd());
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            resolve(filePath);
        } else {
            reject(new Error('Audio file not found'));
        }
    });
}

module.exports = {
    retrieveAudioFile
};