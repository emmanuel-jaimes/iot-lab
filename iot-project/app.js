var firebase = require('firebase/app');
var nodeimu = require('@trbll/nodeimu');
// var sense = require('@trbll/sense-hat-led');
var IMU = new nodeimu.IMU( );
const { getDatabase, ref, onValue, set, update, get } = require('firebase/database');

// Your web app's Firebase configuration
const firebaseConfig = {

    apiKey: "AIzaSyBTfqxmmuPPHPrFrP6HHwhufslo_nFmDeo",
  
    authDomain: "iot-project-8aba5.firebaseapp.com",
  
    databaseURL: "https://iot-project-8aba5-default-rtdb.firebaseio.com",
    // After deploying, view app at [projectId].web.app
    projectId: "iot-project-8aba5",  
  
    storageBucket: "iot-project-8aba5.appspot.com",
  
    messagingSenderId: "1082736731064",
  
    appId: "1:1082736731064:web:58e91dea471104eb8be54d"
  
  };
  
// Initialize Firebase
// const analytics = getAnalytics(app);
firebase.initializeApp(firebaseConfig);
const database = getDatabase();

const initialDict = {
    "temperature": 0,
    "humidity": 0
}

//sends contents of dictionary to database
set(ref(database), initialDict)

// interval for temperature and humidty io
setInterval(() => {
    // get temperature & humidity 
    IMU.getValue((err, data) => {
        if (err) {
            console.error("Error reading sensor data:", err);
            return;
        }
        // Update temperature and humidity values in db
        update(ref(database), {
            "temperature": data.temperature,
            "humidity": data.humidity 
        }).then(() => {
            console.log("Temperature and humidity data sent to database:", data.temperature, data.humidity);
        }).catch((error) => {
            console.error("Error: Failed updating temperature and humidity data:", error);
        });
    });
}, 5000); // 5 second interval


