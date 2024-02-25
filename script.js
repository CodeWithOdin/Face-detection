const video=document.querySelector(".video")


function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
]).then(startVideo);


video.addEventListener('play', () => {
    const canvas= faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const size={width:video.width, height:video.height }
    faceapi.matchDimensions(canvas, size)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resize=faceapi.resizeResults(detections, size)
        canvas.getContext("2d").clearRect(0,0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resize)
        faceapi.draw.drawFaceLandmarks(canvas, resize)
        faceapi.draw.drawFaceExpressions(canvas, resize)        

        if (detections.length > 0) {
            console.log("ok1");
            // Check if face is positioned correctly (for example, check if it's centered)
            const face = detections[0].detection.box;
            if (isFacePositionedCorrectly(face, video.width, video.height,.9,0.5,0.1,0.1)) {            
                 // Redirect to another page
                window.location.href = 'home.html';
            }
        }
    },100);
});


function isFacePositionedCorrectly(face, videoWidth, videoHeight, positionX, positionY, thresholdX, thresholdY) {
    // Calculate the target position coordinates based on video dimensions and thresholds
    const targetX = videoWidth * positionX;
    const targetY = videoHeight * positionY;

    // Check if the center of the face falls within a certain distance from the target position
    return Math.abs((face.x + face.width / 2) - targetX) <= videoWidth * thresholdX &&
           Math.abs((face.y + face.height / 2) - targetY) <= videoHeight * thresholdY;
}