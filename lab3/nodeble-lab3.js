const { createBluetooth } = require( 'node-ble' );

var firebase = require('firebase/app');
var nodeimu = require('@trbll/nodeimu');
var sense = require('@trbll/sense-hat-led');
var IMU = new nodeimu.IMU( );
const { getDatabase, ref, onValue, set, update, get } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = getDatabase();

const initialDict = {
  "temperature": 0,
  "humidity": 0,
  "update_light": false,
  "interval": 1,
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

// TODO: Replace this with your Arduino's Bluetooth address
// as found by running the 'scan on' command in bluetoothctl
const ARDUINO_BLUETOOTH_ADDR = '8D:11:5D:BE:C7:68';

const UART_SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

const EES_SERVICE_UUID       = '0000181a-0000-1000-8000-00805f9b34fb';
const TEMP_CHAR_UUID         = '00002a6e-0000-1000-8000-00805f9b34fb';

let intervalValue = 1;

async function main( )
{
    // Reference the BLE adapter and begin device discovery...
    const { bluetooth, destroy } = createBluetooth();
    const adapter = await bluetooth.defaultAdapter();
    const discovery =  await adapter.startDiscovery();
    console.log( 'discovering...' );

    // Attempt to connect to the device with specified BT address
    const device = await adapter.waitDevice( ARDUINO_BLUETOOTH_ADDR.toUpperCase() );
    console.log( 'found device. attempting connection...' );
    await device.connect();
    console.log( 'connected to device!' );

    // Get references to the desired UART service and its characteristics
    const gattServer = await device.gatt();
    const uartService = await gattServer.getPrimaryService( UART_SERVICE_UUID.toLowerCase() );
    const txChar = await uartService.getCharacteristic( TX_CHARACTERISTIC_UUID.toLowerCase() );
    const rxChar = await uartService.getCharacteristic( RX_CHARACTERISTIC_UUID.toLowerCase() );
    
    // Get references to the desired ESS service and its temparature characteristic.
    // TODO // 
    const essService = await gattServer.getPrimaryService(EES_SERVICE_UUID.toLowerCase());
    const tempChar = await essService.getCharacteristic(TEMP_CHAR_UUID.toLowerCase());

    // Register for notifications on the RX characteristic
    await rxChar.startNotifications( );

    // Callback for when data is received on RX characteristic
    rxChar.on( 'valuechanged', buffer =>
    {
        console.log('Received: ' + buffer.toString());
    });

    // Register for notifications on the temperature characteristic
    // TODO // 
    await tempChar.startNotifications( );

    //Reference for Interval value from database
    const intervalRef = ref(db, 'interval');
    onValue(intervalRef, async (snapshot) => {
        const updateIntervalValue = snapshot.val();
        if (updateIntervalValue <= 10 && updateIntervalValue >= 1) {
            intervalValue = updateIntervalValue;
            console.log('Interval Value updated to: ' + intervalValue);

            //send interval value to arduino
            await sendIntervalValue(intervalValue, txChar);
            
            setInterval(() => {
                // get temperature & humidity 
                IMU.getValue((err, data) => {
                    if (err) {
                        console.error("Error reading sensor data:", err);
                        return;
                    }
                    // Update temperature and humidity values in db
                    update(ref(db), {
                        "humidity": data.humidity 
                    }).then(() => {
                        console.log("Humidity data sent to database:", data.humidity);
                    }).catch((error) => {
                        console.error("Error: Failed updating humidity data:", error);
                    });
                });
            }, intervalValue * 1000); 

        } else {
            console.error('Interval failed out of range (1-10)');
        }
    });
    

    // Callback for when data is received on the temp characteristic
    // TODO //
    tempChar.on('valuechanged', buffer => 
    {   
        const tempRaw = buffer.readInt16LE(0);
        const tempCelc = tempRaw / 100.0;
        console.log('Received Temperature: ' + tempCelc.toFixed(2) + ' ºC');

        update(ref(db), {
            "temperature": tempCelc
        }).then(() => {
            console.log("Temperature data sent to database:", tempCelc);
        }).catch((error) => {
            console.error("Error: Failed updating temperature data:", error);
        });
    });

    
    // interval for humidty io
    


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

    // Set up listener for console input.
    // When console input is received, write it to TX characteristic
    const stdin = process.openStdin( );
    stdin.addListener( 'data', async function( d )
    {
        let inStr = d.toString( ).trim( );

        // Disconnect and exit if user types 'exit'
        if (inStr === 'exit')
        {
            console.log( 'disconnecting...' );
            await device.disconnect();
            console.log( 'disconnected.' );
            destroy();
            process.exit();
        }

        // Specification limits packets to 20 bytes; truncate string if too long.
        inStr = (inStr.length > 20) ? inStr.slice(0,20) : inStr;

        // Attempt to write/send value to TX characteristic
        await txChar.writeValue(Buffer.from(inStr)).then(() =>
        {
            console.log('Sent: ' + inStr);
        });
    });

}

async function sendIntervalValue(interval, txChar) {
    // Convert interval to a buffer
    const intervalBuffer = Buffer.alloc(4); // Assuming interval is a 32-bit integer
    intervalBuffer.writeUint8(interval); // Write interval to the buffer (little-endian)
    
    console.log('Interval Buffer:');
    for (let i = 0; i < intervalBuffer.length; i++) {
        console.log('Byte ' + i + ': ' + intervalBuffer[i].toString(16).toUpperCase().padStart(2, '0'));
    }

    // Write interval value to TX characteristic
    await txChar.writeValue(intervalBuffer);
    console.log('Sent Interval value to Arduino: ' + interval);
    console.log(' end of buffer ');
}



main().then((ret) =>
{
    if (ret) console.log( ret );
}).catch((err) =>
{
    if (err) console.error( err );
});