import requests
import json


def analyzeSentiment(text):
    url = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment"
    payload = {
        "documents": [
            {
                "language": "en",
                "id": "1",
                "text": text
            }
        ]
    }
    payload_str = json.dumps(payload)
    headers = {
        'ocp-apim-subscription-key': "5cbea05edd564e7b889bfabf2da7f96d",
        'content-type': "application/json",
        'accept': "application/json",
        'cache-control': "no-cache",
        'postman-token': "bc5d4888-edc2-038a-8119-953257d95425"
    }

    response = requests.post(url, data=payload_str, headers=headers)
    print response.json()
    return float(response.json()["documents"][0]["score"])
