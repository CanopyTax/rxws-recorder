// We need to be careful about memory leaks here.
let requestMap = {};

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

	requestMap = {};

	window.rxwsHistory.isRecording = true;

	rxws
	.requestUse()
	.subscribe(newRequestOk, newRequestErr);

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
	requestMap = {};
	// we don't re-assign the variable because it's got some properties on it that we want.
	window.rxwsHistory.splice(0, window.rxwsHistory.length);
}

function newRequestOk({req, send, reply, next}) {
	if (window.rxwsHistory.isRecording) {
		requestMap[req.header.correlationId] = req;
	}
	next();
}

function newRequestErr(err) {
	// rxws never calls this anyways, so nothing to do.
}

function handleSuccessfulRequest({res, reply, retry, next}) {
	recordRequestResponse(res.header.correlationId, res);
	next();
}

function handleFailedRequest(error, request) {
	const correlationId = request && request.header ? request.header.correlationId : null;
	recordRequestResponse(correlationId, error, request);
}

function recordRequestResponse(correlationId, response, req) {
	const request = req || requestMap[correlationId];
	delete requestMap[correlationId];

	const statusCode = response && response.header && response.header.statusCode ? response.header.statusCode : 'ERROR_NO_STATUS_CODE';
	const resource = request && request.header ? request.header.resource : 'UNKNOWN_RESOURCE';

	if (window.rxwsHistory.isRecording) {
		// Delete the oldest requests, past MAX_REQUESTS_RECORDED
		if (window.rxwsHistory.length >= window.rxwsHistory.MAX_REQUESTS_RECORDED) {
			const deleteStart = window.rxwsHistory.MAX_REQUESTS_RECORDED - 1;
			window.rxwsHistory.splice(deleteStart, window.rxwsHistory.length - deleteStart)
		}

		window.rxwsHistory.unshift({
			resource,
			request,
			response,
			statusCode,
		});
	}
}
