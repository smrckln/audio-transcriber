# audio-transcriber
---

Simple NodeJS app that takes a video url, downloads audio file and returns transcribed text




##### What's Happening Under The Hood?

I'm leveraging IBM's Bluemix cloud platform with Watson's Speech to Text functionality to take an audio file and return the transcribed text. I'm taking in a youtube url, downloading the audio to a file and passing that file to the Bluemix API. I'm then sending back the transcribed text in somewhat real time, barring any network latency.
