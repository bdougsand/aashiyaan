function encodeParams(obj) {
    return Object.keys(obj)
        .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
        .join("&");
}


export function insertVideoParams(uri, token, meta={}) {
    const upload_url = "https://www.googleapis.com/upload/youtube/v3/videos";

    meta = Object.assign({title: "Untitled",
                          privacy: "private",
                          recorded: new Date()});

    let data = new FormData(),
        params = {part: "id,snippet,recordingDetails,status",
                  uploadType: "resumable"},
        metadata = {
            snippet: {
                description: meta.description,
                title: meta.title
            },
            status: {
                privacyStatus: meta.privacy
            },
            recordingDetails: {
                recordingDate: meta.recorded.toISOString()
            }
        },
        xhr = new XMLHttpRequest();

    let promise = new Promise((resolve, reject) => {
        xhr.addEventListener("error", (e) => {
            // Give more useful error information
            reject({type: "error", error: e});
        });
        xhr.addEventListener("abort", (e) => {
            reject({type: "abort", error: e});
        });
        xhr.addEventListener("load", (e) => {
            if (xhr.status === 200) {
                resolve(xhr.getResponseHeader("Location"), xhr);
            } else {
                console.log(xhr.responseText);
                console.log(xhr.getAllResponseHeaders());
                reject({type: "error", status: xhr.status, response: xhr.responseText});
            }
        });
    });

    xhr.open("POST", `${upload_url}?${encodeParams(params)}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(metadata));

    return promise;
}

export async function insertVideo(uri, token, meta={}) {
    /*
      Meta options: title, description, privacy, recorded
      */
    let uploadUrl = await insertVideoParams(uri, token, meta),
        xhr = new XMLHttpRequest();

    xhr.open("POST", uploadUrl);

    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    // See: https://github.com/facebook/react-native/blob/master/Libraries/Network/convertRequestBody.js
    xhr.send({uri});

    return xhr;
}
