import uuid
import json
import wave

import requests
from bottle import post, request, run

import txt_rcg

dummy_data = {

  "version": "3.0",
  "header": {
    "status": "success",
    "scenario": "ulm",
    "name": "i am mentali divergent in that i'm skipping certain on may be out of my life",
    "lexical": "i am mentali divergent in that i'm skipping certain on may be out of my life",
    "properties": {
      "requestid": "7f9cbbf7-a9a1-4333-9e29-da4568a0b9fb",
      "HIGHCONF": "1"
    }
  },
  "results": [
    {
      "scenario": "ulm",
      "name": "i am mentali divergent in that i'm skipping certain on may be out of my life",
      "lexical": "i am mentali divergent in that i'm skipping certain on may be out of my life",
      "confidence": "0.6888645",
      "properties": {
        "HIGHCONF": "1"
      }
    }
  ]
}


def get_token():

    try:
        response = requests.post(
            url="https://oxford-speech.cloudapp.net/token/issueToken",
            headers={
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            },
            data={
                "client_id": "5cbea05edd564e7b889bfabf2da7f96d",
                "scope": "https%3A%2F%2Fspeech.platform.bing.com",
                "client_secret": "7048cfd4a525435f9b2c1ee6c43647f2",
                "grant_type": "client_credentials",
            },
        )
        print('Response HTTP Status Code: {status_code}'.format(
            status_code=response.status_code))
        print('Response HTTP Response Body: {content}'.format(
            content=response.content))
        json_o = json.loads(response.content)
        return json_o["access_token"]

    except requests.exceptions.RequestException:
        print('HTTP Request failed')
        return None


def send_request(token, data):
    # Sound Request
    # POST https://speech.platform.bing.com/recognize

    try:
        response = requests.post(
            url="https://speech.platform.bing.com/recognize",
            params={
                "version": "3.0",
                "requestid": uuid.uuid4(),
                "appid": "D4D52672-91D7-4C74-8AD8-42B1D98141A5",
                "format": "json",
                "locale": "en-US",
                "device.os": "Windows Phone OS",
                "scenarios": "ulm",
                "instanceid": uuid.uuid4(),
                "maxnbest": "1",
            },
            headers={
                "Content-Type": "audio/wav; samplerate=16000",
                "Authorization": "Bearer %s" % token,
                "Host": "speech.platform.bing.com",
            },
            data=data,
            # files=[ data]
        )
        print('Response HTTP Status Code: {status_code}'.format(
            status_code=response.status_code))
        print('Response HTTP Response Body: {content}'.format(
            content=response.content))

        json_o = json.loads(response.content)
        return json_o["results"][0]["lexical"]

    except requests.exceptions.RequestException:
        print('HTTP Request failed')


def get_dummy_data():
    # json_o = json.loads(dummy_data)
    text = "i am mentali divergent in that i'm skipping certain on may be out of my life"#json_o["results"]["lexical"]
    return text


@post('/speech/')
def speech():
    token = get_token()

    if not token:
        print('Token failure')
        return

    upload = request.files.get('wav')

    # Commented out because server was down
    text = send_request(token, upload.file)
    print text

    # text = get_dummy_data()
    print txt_rcg.analyzeSentiment(text)

run(host='localhost', port=3001)
