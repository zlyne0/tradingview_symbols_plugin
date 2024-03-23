#!/usr/bin/env python
import sys
import json
import struct
import requests

# Read a message from stdin and decode it.
def getMessage():
    rawLength = sys.stdin.buffer.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength).decode('utf-8')
    return json.loads(message)

# Encode a message for transmission,
# given its content.
def encodeMessage(messageContent):
    # https://docs.python.org/3/library/json.html#basic-usage
    # To get the most compact JSON representation, you should specify
    # (',', ':') to eliminate whitespace.
    # We want the most compact representation because the browser rejects # messages that exceed 1 MB.
    encodedContent = json.dumps(messageContent, indent = 4, separators=(',', ':')).encode('utf-8')
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}

# Send an encoded message to stdout
def sendMessage(encodedMessage):
    sys.stdout.buffer.write(encodedMessage['length'])
    sys.stdout.buffer.write(encodedMessage['content'])
    sys.stdout.buffer.flush()

def handleRequest(myRequest):
    if 'urlParams' not in myRequest:
        myRequest.update({'urlParams': {}})
    if 'headers' not in myRequest:
        myRequest.update({'headers': {}})

    if myRequest['type'] == "GET":
        response = requests.get(url = myRequest['url'], params = myRequest['urlParams'], headers = myRequest['headers'])
    else:
        response = requests.post(url = myRequest['url'], params = myRequest['urlParams'], headers = myRequest['headers'], json = myRequest['body'])

    if (response.status_code == 200):
        return {
            "errorCode": response.status_code,
            "data": response.json()
        }
    else:
        return {
            "errorCode": response.status_code,
            "data": response.reason
        }

while True:
    receivedMessage = getMessage()
    '''
    receivedMessage = {
        "type": "POST",
        "url": "https://postman-echo.com/post?a=aaaaa",
        "urlParams": { "a1": "a1v", "a2": "a2v" },
        "body": {
            "body": {
                "bodyTitle": "title example",
                "info": "info example"
            }
        },
        "headers": {
            "headerOne": "headerOneValue",
            "headerTwo": "headerTwoValue",
            "content-type": "myzzz"
        }
    }
    '''

    response = handleRequest(receivedMessage)
    sendMessage(encodeMessage(response))