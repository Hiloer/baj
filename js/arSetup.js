const EVENT_DETECTOR_INIT_RESULT = "DetectorInitResult";
const EVENT_DETECT_RESULT = "DetectorResult";
const EVENT_SESSION_START = 'SessionStart';
const EVENT_SESSION_FAIL = 'SessionFail';
const EVENT_SESSION_STOP = 'SessionStop';

var arSession = window.ucweb && ucweb.ARSession;

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
    MediaStreamTrack.getSources(function(deviceInfos) {

        var constraints;
        var flag = false;

        for (var i = 0; i !== deviceInfos.length; ++i) {

            var deviceInfo = deviceInfos[i];

            if (deviceInfo.kind === 'video' && deviceInfo.facing ===
                'environment') {

                constraints = {
                    video: {
                        mandatory: {
                            sourceId: deviceInfo.id,
                            minWidth: 640,
                            maxWidth: 640,
                            minHeight: 480,
                            maxHeight: 480
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
    });
}