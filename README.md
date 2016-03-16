# rxws-recorder
rxws middleware for helping read websocket requests and responses.

## Motivation
Browser devtool support for requests/responses over websockets is limited because the browser has no way of knowing which response corresponds to which request. Additionally, most of the common backends for [rxws](https://github.com/CanopyTax/rxws) (such as [sock.js](https://github.com/sockjs)) do not send pure JSON to the server, nor do they receive pure JSON, which means that browser devtools can only show the websocket frames as one big string (instead of an explorable json object).

## Solution
rxws-recorder lets you explore the history of rxws requests, responses, and server pushes. It does this by exposing a global object, `rxwsHistory` (or the shorter version `rh`) on the window.

##Quickstart
You must somehow include rxws-recorder into your app. Then you must call `startRecording` either on the global object or through the es6 module. This is usually done with:
```js
import * as rxwsRecorder from 'rxws-recorder';
import rxws from 'rxws';

rxwsRecorder.startRecording(rxws);
```

### Global Object API
####window.rh
An array of request/response objects, ordered from most recent to least recent. Each object has the following schema:
```js
// each object in the array looks like this
{
  resource: 'get.users', // a string
  request: {...}, // the request object
  response: {...}, // the response object
  statusCode: 200, // An integer representing the status code of the request
}
```

####window.rh.mostRecent
Mostly equivalent to doing `rh[0]`, but it handles not having any requests at all.

####window.rh.isRecording
A boolean value that indicates whether rxws-recorder is recording all the request/responses. Instead of changing this value directly, you should call `window.rh.startRecording` or `window.rh.stopRecording`. Otherwise things will not work.

####window.rh.startRecording(rxws)
Call this function when you want rxws-recorder to start recording all websocket requests.

**Parameters**
- rxws: the value that is the default export of the rxws npm package.

####window.rh.stopRecording()
Call this function when you want rxws-recorder to stop recording all websocket requests. Already recorded requests will be preserved.

####window.rh.MAX_REQUESTS_RECORDED
An integer that represents the maximum number of objects to keep in the `window.rh` array. Defaults to 50. This value can be mutated directly by the user.

####window.rh.clear()
A function that clears out all request/response objects in the `window.rh` array. Does not change `window.rh.isRecording`.

###ES6 Module API
rxws-recorder doesn't export a default export, but does export several named functions

####startRecording(rxws)
See the global equivalent above.

####stopRecording()
See the global equivalent above.

####setMaxRequestsRecorded(max)
Call this only after you have called `startRecording`.

**Parameters**
- max: a positive integer that represents the maximum number of requests that will be in memory at any time.

####clear()
See the global equivalent above.
