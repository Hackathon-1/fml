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

#Transfer x amount of money from SP to producer
def percentContribute(amount):

    #TODO: calculate amount here based on sentiment here
    amount = getSPAmount() * 1

    #Test. To be removed later
    print amount

    payload = {
        "medium": "balance",
        "payee_id": "57097a02319313dd1b43b29d",
        "amount": amount,
        "transaction_date": "2016-09-17",
        "description": "Nice Video!"
    }

    requests.post(
        'http://api.reimaginebanking.com/accounts/57097f4a319313dd1b43b2bd/transfers?key=cf6fe22672e82008e57d304ac6e0d669',
        data=json.dumps(payload),
        headers={'content-type':'application/json'},
    )

    return math.floor(amount / 100)


print "SP amount: " + str(getSPAmount());
print "Producer Amount: " + str(getProducerAmount());
