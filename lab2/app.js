var firebase = require('firebase/app');
var nodeimu = require('@trbll/nodeimu');
var sense = require('@trbll/sense-hat-led');
var IMU = new nodeimu.IMU( );
const { getDatabase, ref, onValue, set, update, get } = require('firebase/database');

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCATYjIsbinLsLmzwtbiLYmju3fdq7bqgc",
  authDomain: "lab2-b6ec4.firebaseapp.com",
  databaseURL: "https://lab2-b6ec4-default-rtdb.firebaseio.com",
  projectId: "lab2-b6ec4",
  storageBucket: "lab2-b6ec4.appspot.com",
  messagingSenderId: "1079599575147",
  appId: "1:1079599575147:web:a01e9664e0ff89ccb4412e",
  measurementId: "G-3M0641J8V6"
};
// Initialize Firebase
// const analytics = getAnalytics(app);
firebase.initializeApp(firebaseConfig);
const db = getDatabase();

const initialDict = {
  "temperature": 0,
  "humidity": 0,
  "update_light": false,
  "light_info": {
    "light_r": 0,
    "light_b": 0,
    "light_g": 0,
    "light_row": 0,
    "light_col": 0
  }
}
// sends contents of dictionary to db
set(ref(db), initialDict); 

// interval for temperature and humidty io
setInterval(() => {
    // get temperature & humidity 
    IMU.getValue((err, data) => {
        if (err) {
            console.error("Error reading sensor data:", err);
            return;
        }
        // Update temperature and humidity values in db
        update(ref(db), {
            "temperature": data.temperature,
            "humidity": data.humidity 
        }).then(() => {
            console.log("Temperature and humidity data sent to database:", data.temperature, data.humidity);
        }).catch((error) => {
            console.error("Error: Failed updating temperature and humidity data:", error);
        });
    });
}, 5000); // 5 second interval

const updateLightRef = ref(db, 'update_light'); // reference of update_light
onValue(updateLightRef, (snapshot) => { 
    const updateLightValue = snapshot.val();
    if (updateLightValue === true) {
        // changes indicated light at row, col, from database
        const lightInfoRef = ref(db, 'light_info'); // Sets paramater for refrenceing database value of light_info
        get(lightInfoRef).then((snapshot) => { // snapshots/gets values in database when tru
            const lightInfo = snapshot.val(); // set snapshot = lightInfo param
            sense.setPixel(lightInfo.light_row, lightInfo.light_col, [lightInfo.light_r, lightInfo.light_g, lightInfo.light_b]);
            console.log(`Changed light at row ${lightInfo.light_row} and col ${lightInfo.light_col} to RGB(${lightInfo.light_r},${lightInfo.light_g},${lightInfo.light_b})`);
        }).catch((error) => {
            console.error("Error getting light info from Firebase:", error);
        });
        //reset update_light value to false
        update(ref(db), {
            "update_light": false
        });
    }
});