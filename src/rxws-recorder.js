const window = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : self);

window.rxwsHistory = window.rh = [];
window.rxwsHistory.isRecording = false;
window.rxwsHistory.startRecording = startRecording;
window.rxwsHistory.stopRecording = stopRecording;
window.rxwsHistory.MAX_REQUESTS_RECORDED = 50;
window.rxwsHistory.clear = clear;
Object.defineProperty(window.rxwsHistory, 'mostRecent', {
	get: () => (window.rxwsHistory.length > 0 ? window.rxwsHistory[0] : 'No request recorded')
})

export function startRecording(rxws) {
	if (!rxws) {
		throw new Error(`Must provide rxws object, to apply middleware to`)
	}

	window.rxwsHistory.isRecording = true;

	rxws
	.use()
	.subscribe(handleSuccessfulRequest, handleFailedRequest);
}

export function stopRecording() {
	window.rxwsHistory.isRecording = false;
}

export function setMaxRequestsRecorded(max) {
	window.rxwsHistory.MAX_REQUESTS_RECORDED = max;
}

export function clear() {
	// we don't re-assign the variable because it's got some properties on it that we want.
	window.rxwsHistory.splice(0, window.rxwsHistory.length);
}

function handleSuccessfulRequest({req, res, reply, retry, next}) {
	recordRequestResponse(req, res);
	next();
}

function handleFailedRequest({req, err}) {
	recordRequestResponse(req, err);
}

function recordRequestResponse(request, response) {
	const statusCode = response && response.header && response.header.statusCode ? response.header.statusCode : 'ERROR_NO_STATUS_CODE';
	const resource = request && request.header ? request.header.resource : 'UNKNOWN_RESOURCE';

	if (window.rxwsHistory.isRecording) {
		// Delete the oldest requests, past MAX_REQUESTS_RECORDED
		if (window.rxwsHistory.length >= window.rxwsHistory.MAX_REQUESTS_RECORDED) {
			const deleteStart = window.rxwsHistory.MAX_REQUESTS_RECORDED - 1;
			window.rxwsHistory.splice(deleteStart, window.rxwsHistory.length - deleteStart)
		}

		try {
			window.rxwsHistory.unshift(JSON.parse(JSON.stringify({
				resource,
				request,
				response,
				statusCode,
			})));
		} catch (ex) {
			console.error(`Could not add web socket event to rxws-recorder history. Error was`);
			console.error(ex);
		}
	}
}
