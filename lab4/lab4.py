#!/usr/bin/env python3
import datetime
import paho.mqtt.client as mqtt
import json
import pprint   
import time
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("uiowa/iot/lab4/#")
    
def on_message(client, userdata, msg):
    print("Received a message on topic: " + msg.topic)
    m_decode=str(msg.payload.decode("utf-8", "ignore"))
    print("type of decoded message payload is: " + str(type(m_decode)))
    msg_payload = json.loads(m_decode)
    print("Type of msg_payload after json.loads() is: " + str(type(msg_payload)))
    print("Contents of message payload: ")
    pp = pprint.PrettyPrinter(indent=2)
    pp.pprint(msg_payload)
    
    # TODO: Extract info from the message; write it to InfluxDB
    pointData = {
        "measurement": msg.topic[-4:],
        "fields": {
            "usage": float(msg_payload)
        }
    }
    influx_write_api.write(bucket=bucket, record=[pointData])

# TODO: Initialize the InfluxDB client
bucket = "lab4"
url = ""
org = ""
token = ""

influx_client = InfluxDBClient(url=url, token=token, org=org)
influx_write_api = influx_client.write_api(write_options=SYNCHRONOUS)

# Initialize the MQTT client that should connect to the Mosquitto broker
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
connOK=False
while(connOK == False):
    try:
        mqtt_client.connect("broker.hivemq.com", 1883, 60)
        connOK = True
    except:
        connOK = False
    time.sleep(1)

# Blocking loop to the Mosquitto broker
mqtt_client.loop_forever()
