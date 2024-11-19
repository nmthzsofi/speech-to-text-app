const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
    
});
console.log('Refresh Token:', process.env.REFRESH_TOKEN);


// Function to send email
async function sendEmail(fileContent) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
            logger: true, // Logs SMTP activity
            debug: true,  // Outputs connection debug information
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Or a recipient email address
            subject: 'New Submission',
            text: fileContent,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}




const express = require('express');
const multer = require('multer');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static(path.join(__dirname)));

// Initialize Google Cloud Speech-to-Text
const speechClient = new SpeechClient({
    keyFilename: process.env.KEY
});

// Handle audio file upload and transcription
app.post('/upload-audio', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    const audio = { content: fs.readFileSync(filePath).toString('base64') };
    const request = {
        audio: audio,
        config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
        },
    };

    speechClient.recognize(request)
        .then(response => {
            const transcript = response[0].results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            res.json({ transcript });
        })
        .catch(err => {
            res.status(500).json({ error: 'Error processing audio file', details: err });
        });
});

// Handle saving all answers
app.post('/save-all-answers', async (req, res) => {
    const answers = req.body.answers;
    const fileName = `session_${Date.now()}.txt`;
    const outputPath = path.join(__dirname, 'transcripts', fileName);

    let fileContent = '';
    for (const [question, answer] of Object.entries(answers)) {
        fileContent += `Question ${question}:\n${answer}\n\n`;
    }

    try {
        // Save answers to a file
        await fs.promises.writeFile(outputPath, fileContent);

        // Send email with the answers
        await sendEmail(fileContent);

        res.json({ message: 'Answers saved and email sent successfully', file: fileName });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing request', details: error });
    }
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
});

app.get('/test-email', async (req, res) => {
    try {
        await sendEmail('This is a test email from the server.');
        res.json({ message: 'Test email sent successfully' });
    } catch (err) {
        console.error('Error sending test email:', err);
        res.status(500).json({ error: 'Test email failed', details: err.message });
    }
});


