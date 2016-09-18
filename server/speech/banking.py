import requests
import json
import math

#identifiers
serviceProvider = '57097f4a319313dd1b43b2bd'
producerid = '57097a02319313dd1b43b29d'
apiKey = 'cf6fe22672e82008e57d304ac6e0d669'

#Get the amount of money in the Service Provider's account
def getSPAmount():
    r = requests.get('http://api.reimaginebanking.com/accounts/57097f4a319313dd1b43b2bd?key=cf6fe22672e82008e57d304ac6e0d669')
    return json.loads(r.text)['balance']

#clear the producer's account
def clear():
    payload = {
        "medium": "balance",
        "payee_id": "570986c4319313dd1b43b2e9",
        "amount": getSPAmount(),
        "transaction_date": "2016-04-09",
        "status": "completed",
        "description": "string"
    }

    res = requests.post(
        'http://api.reimaginebanking.com/accounts/57097f4a319313dd1b43b2bd/transfers?key=cf6fe22672e82008e57d304ac6e0d669',
        data=json.dumps(payload),
        headers={'content-type':'application/json'},
    )

#Get the amount of money in the person's bank account
def getProducerAmount():
    r = requests.get('http://api.reimaginebanking.com/accounts/57097a02319313dd1b43b29d?key=cf6fe22672e82008e57d304ac6e0d669')
    return json.loads(r.text)['balance']

#generate amount of money a content-provider gets based on emotional_distance
def amountContribute(emotions, expected):

    #TODO: calculate amount here based on sentiment here
    emotional_distance = 1

    for emotion in emotions:
        emotional_distance -= abs(emotions[emotion]-expected[emotion])

    payload = {
        "medium": "balance",
        "payee_id": "57097a02319313dd1b43b29d",
        "amount": emotional_distance,
        "transaction_date": "2016-09-18",
        "description": "Nice Video!"
    }

    requests.post(
        'http://api.reimaginebanking.com/accounts/57097f4a319313dd1b43b2bd/transfers?key=cf6fe22672e82008e57d304ac6e0d669',
        data=json.dumps(payload),
        headers={'content-type':'application/json'},
    )

    return emotional_distance

# ###Example
##
## emotions from API 
##
# emotions = { 
#     "anger": 0.00300731952,
#       "contempt": 5.14648448E-08,
#       "disgust": 9.180124E-06,
#       "fear": 0.0001912825,
#       "happiness": 0.9875571,
#       "neutral": 0.0009861537,
#       "sadness": 1.889955E-05,
#       "surprise": 0.008229999 
# }


# expected from content-provider
# expected = { 
#     "anger": 0,
#       "contempt": 5.14648448E-08,
#       "disgust": 9.180124E-06,
#       "fear": 0.0001912825,
#       "happiness": 0.9875571,
#       "neutral": 0.0009861537,
#       "sadness": 1.889955E-05,
#       "surprise": 0.008229999 
# }

# print getSPAmount()
# print getProducerAmount() 

# percentContribute(emotions, expected)
