const EVENT_DETECTOR_INIT_RESULT = "DetectorInitResult";
const EVENT_DETECT_RESULT = "DetectorResult";
const EVENT_SESSION_START = 'SessionStart';
const EVENT_SESSION_FAIL = 'SessionFail';
const EVENT_SESSION_STOP = 'SessionStop';

var arSession = window.ARSession;

function registerAR(start, detected) {
    if (arSession) {
        arSession.addEventListener(EVENT_DETECTOR_INIT_RESULT, function(code) {
            console.log('init resutl is: ' + code);
        });

        arSession.addEventListener(EVENT_DETECT_RESULT, detected);
        arSession.addEventListener(EVENT_SESSION_START, start);

        _startARStream();
    }
}

function _startARStream() {
    navigator.mediaDevices.enumerateDevices()
        .then(function(deviceInfos) {
            var flag = false;
            for (var i = 0; i !== deviceInfos.length; ++i) {
                var deviceInfo = deviceInfos[i];
                // label: "camera2 1, facing front"
                // label: "camera2 0, facing back"
                if (deviceInfo.kind === 'videoinput' && deviceInfo.label === 'camera2 0, facing back') {
                    constraints = {
                        audio: {
                            deviceId: {
                                exact: "default"
                            }
                        },
                        video: {
                            width: 1280,
                            height: 720,
                            deviceId: {
                                exact: deviceInfo.deviceId
                            }
                        }
                    };
                    flag = true;
                }
            }
            if (!flag) {
                constraints = {
                    video: true
                };
            }
            arSession.start(constraints);
        })
        .catch(function(error) {})
}