## Series of Internet of Things Labs
Jump to:
[Lab 1](#Lab-1)
[Lab 2](#Lab-2)
[Lab 3](#Lab-3)
[Lab 4](#Lab-4)

# Lab 1
### Overview
This lab was useful for covering the basics of the Raspberry Pi and Arduino platforms and their use for collecting basic sensor data. Useful knowlegde of sshing into the Pi and interfacing the Raspbian OS with the appropriate sensors. The purpose of this lab was to write a simple C++ program to collect and display sensor data once per second and the average of the latest 10 collected samples. Additional sensors were interfaced using an Arduino Nano BLE where code was developed and compiled on a host computer and downloaded onto the Arduino via USB connection. 

# Lab 2
### Overview
This labs objective is to gain experience with a cloud-based publisher/subscriber service, Firebase, and architecting services for IoT solutions. Using several frameworks like, Node.js, Firebase JS library, nodeimu library, and sense-hat library for Node.js, an application is created that communicates and facilitates actions locally with the Pi's sensors and remotely to a Firebase Databas. 

# Lab 3
### Overview:
In Lab 03, we delve into Bluetooth Low Energy (BLE) integration between Arduino and Raspberry Pi, expanding on our previous labs. Utilizing node.js libraries on the Pi and Arduino BLE library on the Arduino, we establish bi-directional communication, transmitting temperature data from Arduino to Pi, then publishing it to Firebase. Additionally, we explore the control of data collection intervals remotely through Firebase, enhancing our understanding of IoT device interaction.

From an IoT perspective, the lab demonstrates seamless integration between the Arduino and Raspberry Pi, leveraging Bluetooth Low Energy for communication and Firebase for data management. Initially, we encountered challenges in setting up the Bluetooth stack and ensuring proper communication between devices, but thorough troubleshooting resolved these issues. Throughout the process, we observed the importance of precise data formatting and synchronization for effective communication. We gained insights into the intricacies of IoT device interaction, emphasizing the critical role of protocol adherence and error handling in maintaining a reliable system.
The JavaScript Code uses the createBluetooth function from the node-ble library to create a Bluetooth connection. After establishing connection via Bluetooth, the javascript code subscribes to notifications on the characteristic corresponding to the data exchange protocol. When the data is recieved, the javascript code handles the data appropriately, displaying it to the console, sending it to the database, and as well as transmitting back to the Arduino.

# Lab 4
### Overview:
The lab aims to establish a monitoring system for IoT devices using a Raspberry Pi. In this setup, three remote CPUs periodically report their CPU utilization to an MQTT broker. The subsequent steps involve setting up InfluxDB, a time-series database, and Grafana, a visualization and analysis tool, on the Raspberry Pi. Additionally, a Python program will be developed to subscribe to MQTT topics, retrieve CPU usage data, and store it in the InfluxDB database. Grafana will then connect to the database to facilitate visualization and analysis of the collected time-series data. Ultimately, this system enables the monitoring of CPU usage for the remote devices and supports in-depth analysis and visualization of the gathered data.

Steps to Complete Lab:
This lab intricately weaves together multiple components to construct a comprehensive IoT monitoring system. Beginning with MQTT, a lightweight pub-sub protocol, the setup establishes seamless communication channels between remote CPUs and a central broker, facilitating the exchange of crucial CPU utilization data. Leveraging JSON for message formatting ensures compatibility and efficient parsing across the system. Transitioning to InfluxDB, a specialized time-series database, Python serves as the conduit, seamlessly bridging MQTT data streams to persistent storage. This integration optimizes data storage and retrieval, pivotal for IoT applications reliant on historical data analysis. Grafana then provides an intuitive interface for visualizing and analyzing data stored in InfluxDB, empowering users to create dynamic dashboards and insights into CPU utilization trends. The end-to-end integration enables real-time monitoring and informed decision-making, enhancing overall system efficiency and performance optimization.

### IoT Integration:
This lab combines multiple components to construct a comprehensive IoT CPU monitoring system. We followed the setup steps provided in the lab 4 pdf to establish communication channels between remote CPUs and the central broker, and to establish the Python program-Server relationship. Leveraging JSON for message formatting made sure of compatibility and efficient parsing across the system. Grafana then provides an intuitive interface for visualizing and analyzing data stored in InfluxDB, empowering users to create dynamic dashboards and insights into CPU utilization trends. The end-to-end integration enables real-time monitoring and informed decision-making, enhancing overall system efficiency and performance optimization.

Grafana Readings

<img width="468" alt="image" src="https://github.com/user-attachments/assets/602993db-7747-4720-8e7a-5cd5cae19b7d">

Mosquitto MQTT Broker 

<img width="311" alt="image" src="https://github.com/user-attachments/assets/dd39f086-2db6-4800-9973-96948fe46cef">

Communication Output

<img width="317" alt="image" src="https://github.com/user-attachments/assets/6a849009-3c05-4a72-ba2e-b581787af8c0">

