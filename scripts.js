const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";
document.querySelector('#user-name').innerHTML = userName;

//if trying it on a another computer use your computes private IP if use AWS or Google use instancec publick I P address
// const socket = io.connect('https://192.168.8.118:8181/',{
const socket = io.connect('https://localhost:8181/',{
    auth: {
        userName, password
    }
});

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream; // a var to hold the local video stream
let remoteStream; // a var to hold the remote video stream
let peerConnection; // the peerConnection that the two clients use to talk
let didIOffer = false;

let peerConfiguration = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}

// when a client initiates a call
const call = async e => {
    await fetchUserMedia();

    // peerConnection is all set with our STUN servers sent over
    await createPeerConnection();

    // create offer time!
    try {
        console.log("Creating offer...");
        const offer = await peerConnection.createOffer();
        console.log(offer);
        await peerConnection.setLocalDescription(offer);
        didIOffer = true;
        socket.emit('newOffer', offer); // send offer to signalingServer
    } catch (err) {
        console.log(err);
    }
}

const answerOffer = async (offerObj) => {
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer); // this is CLIENT2, and CLIENT2 uses the answer as the localDesc
    console.log(offerObj);
    console.log(answer);
    offerObj.answer = answer; 
    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(c);
        console.log("======Added Ice Candidate======");
    });
    console.log(offerIceCandidates);
}

const addAnswer = async (offerObj) => {
    await peerConnection.setRemoteDescription(offerObj.answer);
}

const fetchUserMedia = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                // audio:true,
                audio: { channels: 2, autoGainControl: false, echoCancellation: false, noiseSuppression: false }});
            localVideoEl.srcObject = stream;
            localStream = stream;    
            resolve();    
        } catch (err) {
            console.log(err);
            reject();
        }
    });
}

const createPeerConnection = (offerObj) => {
    return new Promise(async (resolve, reject) => {
        peerConnection = new RTCPeerConnection(peerConfiguration);
        remoteStream = new MediaStream();
        remoteVideoEl.srcObject = remoteStream;

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }

        peerConnection.addEventListener("signalingstatechange", (event) => {
            console.log(event);
            console.log(peerConnection.signalingState);
        });

        peerConnection.addEventListener('icecandidate', e => {
            if (e.candidate) {
                socket.emit('sendIceCandidateToSignalingServer', {
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                });
            }
        });

        peerConnection.addEventListener('track', e => {
            e.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            });
        });

        if (offerObj) {
            await peerConnection.setRemoteDescription(offerObj.offer);
        }
        resolve();
    });
}

const addNewIceCandidate = iceCandidate => {
    peerConnection.addIceCandidate(iceCandidate);
    console.log("======Added Ice Candidate======");
}

document.querySelector('#call').addEventListener('click', call);
