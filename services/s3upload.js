// import CryptoJS from "crypto-js";
// Need CryptoJS to use this
var CryptoJS;

import * as config from "../config.js";


function pad(s, n, chr, side) {
    chr = chr[0];
    s = ""+s;
    var pad = "";
    for (var i = n - s.length; i > 0; i--) {
        pad += chr;
    }
    return !side ? pad + s : s + pad;
}

function yyyymmdd(dt) {
    return [dt.getFullYear(), pad(dt.getMonth()+1, 2, "0"),
            pad(dt.getDate(), 2, "0")].join("");
}

function amzDate(dt) {
    return `${yyyymmdd(dt)}T000000Z`;
}

function getPolicy(bucket_name, key_id, bucket_region="us-east-2",
                   expire_ms=1800000) {
    let now = new Date(),
        expire = new Date(now.getTime()+expire_ms);

    // See here for some more possible conditions:
    // https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html
    return { "expiration": expire.toISOString(),
             "conditions": [
                 {"bucket": bucket_name},
                 ["starts-with", "$key", "uploads/"],
                 {"x-amz-credential": `${key_id}/${yyyymmdd(now)}/${bucket_region}/s3/aws4_request`},
                 {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
                 {"x-amz-date": amzDate(now) }
             ]
           };
}

function encodePolicy(policy) {
    // May need to install base-64...
    return btoa(JSON.stringify(policy));
}

function getSignatureKey(date, secret_key, region="us-east-2") {
    let datekey = CryptoJS.HmacSHA256(yyyymmdd(date), `AWS4${secret_key}`);
    let regionkey = CryptoJS.HmacSHA256(region, datekey);
    let servicekey = CryptoJS.HmacSHA256("s3", regionkey);

    return CryptoJS.HmacSHA256("aws4_request", servicekey);
}

function signPolicy(encoded_policy, date, secret_key, region) {
    return CryptoJS.HmacSHA256(
        encoded_policy,
        getSignatureKey(date, secret_key, region)
    ).toString(CryptoJS.enc.Hex);
}

export function uploadFile(fileurl,
                           key_id=config.S3_ACCESS_KEY_ID,
                           secret=config.S3_SECRET,
                           bucket_name=config.S3_BUCKET,
                           region=config.S3_REGION) {
    var xhr = new XMLHttpRequest(),
        url = `http://${bucket_name}.s3.amazonaws.com/`,
        filename = fileurl.split("/").pop(),
        data = new FormData(),
        now = new Date(),
        datestr = yyyymmdd(now);

    data.append("key", `uploads/${filename}`);
    data.append("X-Amz-Credential", `${key_id}/${yyyymmdd(now)}/${region}/s3/aws4_request`);
    data.append("X-Amz-Algorithm","AWS4-HMAC-SHA256");
    data.append("X-Amz-Date", amzDate(now));

    let policy = getPolicy(bucket_name, key_id, region),
        b64Policy = encodePolicy(policy),
        key = getSignatureKey(now, secret, region),
        sig = CryptoJS.HmacSHA256(b64Policy, key).toString(CryptoJS.enc.Hex);

    data.append("Policy", b64Policy);
    data.append("X-Amz-Signature", sig);

    data.append("file", {uri: fileurl, name: filename, type: ""});

    xhr.open("POST", url);
    xhr.send(data);
    return xhr;
}
