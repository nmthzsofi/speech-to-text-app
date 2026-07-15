# Speech-to-Text Survey

A browser-based survey application that records spoken responses, transcribes them with Google Cloud Speech-to-Text, and delivers completed submissions by email through Gmail OAuth 2.0.

## Features

- In-browser audio recording with the MediaRecorder API
- Speech transcription through Google Cloud Speech-to-Text
- Local, timestamped transcript storage
- Email delivery using Gmail OAuth 2.0
- Automatic creation of upload and transcript directories

## Tech Stack

Node.js, Express, JavaScript, Google Cloud Speech-to-Text, Multer, Nodemailer, and Gmail OAuth 2.0.

## Technical Overview

- Captures `WEBM_OPUS` audio in the browser using the MediaRecorder API
- Transfers recordings to an Express API as multipart form data
- Converts audio to Base64 for Google Cloud Speech recognition
- Aggregates responses into timestamped text files using asynchronous filesystem operations
- Sends completed submissions through an OAuth 2.0-authenticated Gmail transport
