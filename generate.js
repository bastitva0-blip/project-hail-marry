// ═══════════════════════════════════════════════════
//  Device Generation — 1000-device fleet seed
// ═══════════════════════════════════════════════════
import { TYPES, TYPE_KEYS } from './types.js'

export const LOCATIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhimavaram', 'Palakollu',
  'Tadepalligudem', 'Narsapur', 'Undi', 'Vijayawada', 'Visakhapatnam',
  'Guntur', 'Kakinada', 'Eluru', 'Rajkot', 'Surat', 'Indore', 'Bhopal',
  'Nagpur', 'Nashik', 'Coimbatore', 'Madurai', 'Kochi', 'Thiruvananthapuram',
  'Bhubaneswar', 'Patna', 'Raipur', 'Guwahati', 'Dehradun', 'Chandigarh',
]

export const VENDORS = {
  street_light:          ['Signify', 'GE Lighting', 'Havells', 'Bajaj Electricals', 'Eaton'],
  smart_meter:           ['L&T', 'Secure Meters', 'Genus', 'Landis+Gyr', 'Itron'],
  tank:                  ['AquaSense', 'WaterTech', 'Grundfos', 'Krohne', 'VEGA'],
  motor:                 ['Kirloskar', 'ABB', 'Siemens', 'WEG', 'Bharat Bijlee'],
  traffic:               ['Q-Free', 'Siemens', 'Aldridge', 'Yunex', 'SWARCO'],
  parking:               ['ParkSmart', 'Bosch', 'Swarco', 'Parklio', 'IEM'],
  water_quality:         ['HydroLab', 'YSI', 'Hach', 'Xylem', 'In-Situ'],
  air_quality:           ['AirSense', 'Vaisala', 'Aeroqual', 'Enviro', 'Breeze'],
  dustbin:               ['CleanTech', 'Bigbelly', 'Nordsense', 'Sensoneo', 'SmartBin'],
  solar:                 ['Luminous', 'Delta', 'SMA', 'Fronius', 'ABB'],
  soil_moisture:         ['AgroSense', 'Campbell', 'Davis', 'Decagon', 'Sentek'],
  weather_station:       ['Davis Instruments', 'Vaisala', 'Campbell', 'Met One', 'Onset'],
  gas_leak:              ['SafeAir', 'Honeywell', 'MSA', 'Draeger', 'RAE Systems'],
  irrigation_valve:      ['AgroSense', 'Rain Bird', 'Hunter', 'Netafim', 'Toro'],
  ev_charger:            ['Exicom', 'ABB', 'Schneider', 'Delta', 'Ather'],
  rain_wind:             ['Davis Instruments', 'Vaisala', 'Gill', 'RM Young', 'LSI'],
  industrial_machine:    ['Siemens', 'ABB', 'FANUC', 'Mitsubishi', 'SKF'],
  agri_controller:       ['AgroSense', 'Netafim', 'Lindsay', 'Valmont', 'Trimble'],
  gps_tracker:           ['Concox', 'Teltonika', 'Queclink', 'Calamp', 'Eelink'],
  building_gateway:      ['Honeywell', 'Johnson Controls', 'Siemens', 'Schneider', 'JCI'],
  cctv_gateway:          ['Hikvision', 'Dahua', 'Axis', 'Bosch', 'Hanwha'],
  fleet_gateway:         ['Concox', 'Teltonika', 'Geotab', 'Samsara', 'Verizon'],
  smart_home:            ['Google Nest', 'Amazon Echo', 'Samsung SmartThings', 'Philips Hue'],
  fire_alarm_gateway:    ['Honeywell', 'Siemens', 'Bosch', 'Notifier', 'Napco'],
  smoke_detector:        ['Honeywell', 'Kidde', 'First Alert', 'FireAngel', 'Nest'],
  irrigation_controller: ['AgroSense', 'Rain Bird', 'Hunter', 'Toro', 'Irritrol'],
  machine_monitor_unit:  ['Siemens', 'Emerson', 'National Instruments', 'Fluke', 'SKF'],
  water_flow_meter:      ['Itron', 'Badger Meter', 'Sensus', 'Kamstrup', 'Elster'],
  generator_monitor:     ['Cummins', 'Caterpillar', 'Kohler', 'MTU', 'Perkins'],
}

export const CONNS = ['WiFi', 'LTE', '4G', 'NB-IoT', 'LoRa']

// ────── helpers ──────
let _devId = 1
export const rnd  = (a, b) => a + Math.random() * (b - a)
export const ri   = (a, b) => Math.round(rnd(a, b))
export const pk   = arr   => arr[Math.floor(Math.random() * arr.length)]
export const mkFW = ()    => `v${ri(1, 5)}.${ri(0, 9)}.${ri(0, 9)}`

// ────── sensor value initialisation ──────
export function initValues(type) {
  switch (type) {
    case 'street_light':
      return { voltage: rnd(220,250), current: rnd(0,2.5), load: rnd(0,500), energy: rnd(50,300), pf: rnd(0.85,1), temp: rnd(28,55) }
    case 'smart_meter':
      return { voltage: rnd(220,250), current: rnd(1,20), load: rnd(200,5000), energy: rnd(100,2000), pf: rnd(0.88,0.99), freq: rnd(49.5,50.5) }
    case 'tank':
      return { level: rnd(15,95), volume: rnd(500,15000), temp: rnd(20,38), pump: pk(['Running','Idle']) }
    case 'motor':
      return { voltage: rnd(380,440), current: rnd(4,25), rpm: rnd(800,3000), vibration: rnd(0.5,6), temp: rnd(35,85), runHours: rnd(0,15000) }
    case 'traffic':
      return { phase: pk(['Green','Yellow','Red']), cycle: rnd(60,120), vehicles: rnd(30,350), health: rnd(70,100) }
    case 'parking': {
      const t = ri(50,300), o = ri(0,t)
      return { total:t, occupied:o, available:t-o, occupancy: o/t*100, entries: ri(50,600), exits: ri(40,580), avgDuration: rnd(20,150), revenue: rnd(500,15000) }
    }
    case 'water_quality':
      return { ph: rnd(6.2,8.8), tds: rnd(100,900), turbidity: rnd(0.5,15), temp: rnd(18,35) }
    case 'air_quality':
      return { aqi: rnd(20,250), pm25: rnd(5,200), pm10: rnd(10,300), co2: rnd(350,1000), co: rnd(0.1,8), no2: rnd(5,120), so2: rnd(2,100), o3: rnd(10,100), temp: rnd(20,42), humidity: rnd(30,85) }
    case 'dustbin':
      return { fill: rnd(5,95), weight: rnd(2,60), lid: pk(['Open','Closed']), battery: rnd(15,100) }
    case 'solar':
      return { panelVoltage: rnd(300,460), panelCurrent: rnd(3,18), power: rnd(100,8000), generated: rnd(2,40), battery: rnd(30,100) }
    case 'soil_moisture':
      return { moisture: rnd(15,85), soilTemp: rnd(18,40), ec: rnd(0.3,4), battery: rnd(20,100) }
    case 'weather_station':
      return { temp: rnd(18,48), humidity: rnd(25,95), rainfall: rnd(0,25), windSpeed: rnd(0,50), pressure: rnd(990,1030) }
    case 'gas_leak':
      return { gasLevel: rnd(0,250), status: 'Safe', temp: rnd(22,50), battery: rnd(30,100) }
    case 'irrigation_valve':
      return { flowRate: rnd(0,100), valveStatus: pk(['Open','Closed']), pressure: rnd(0.5,5), totalFlow: rnd(200,8000) }
    case 'ev_charger':
      return { voltage: rnd(210,250), current: rnd(6,32), power: rnd(1.5,22), sessionEnergy: rnd(5,80), connector: pk(['Connected','Idle']) }
    case 'rain_wind':
      return { rainfall: rnd(0,25), totalRainfall: rnd(5,100), windSpeed: rnd(0,60), windGust: rnd(5,90), windDirection: pk(['N','NE','E','SE','S','SW','W','NW']) }
    case 'industrial_machine':
      return { status: 'Running', rpm: rnd(800,3500), current: rnd(5,35), vibration: rnd(0.5,9), temp: rnd(30,100), health: rnd(55,100), runHours: rnd(100,20000) }
    case 'agri_controller':
      return { soilMoisture: rnd(15,80), soilTemp: rnd(18,42), humidity: rnd(35,85), lightIntensity: rnd(2000,100000), pump: pk(['Running','Idle']) }
    case 'gps_tracker':
      return { speed: rnd(0,100), fuelLevel: rnd(10,100), ignition: pk(['ON','OFF']), odometer: rnd(1000,150000), location: 'NH-16' }
    case 'building_gateway':
      return { connectedDevices: ri(10,300), temp: rnd(18,35), humidity: rnd(35,70), energyLoad: rnd(5,200), uptime: rnd(90,100) }
    case 'cctv_gateway':
      return { camerasOnline: ri(2,32), storageUsed: rnd(20,95), bandwidth: rnd(5,100), motionEvents: ri(50,800), recording: 'Active' }
    case 'fleet_gateway':
      return { vehiclesConnected: ri(5,80), avgSpeed: rnd(20,80), activeTrips: ri(2,40), alertsToday: ri(0,15) }
    case 'smart_home':
      return { devicesConnected: ri(5,50), temp: rnd(19,32), humidity: rnd(35,70), energyUsage: rnd(2,25), mode: 'Home' }
    case 'fire_alarm_gateway':
      return { zonesMonitored: ri(4,24), activeAlarms: Math.random() > 0.98 ? 1 : 0, batteryBackup: rnd(75,100), status: 'Normal' }
    case 'smoke_detector':
      return { smokeLevel: rnd(0,25), temp: rnd(18,45), battery: rnd(30,100), status: 'Clear' }
    case 'irrigation_controller':
      return { activeZone: `Zone ${ri(1,8)}`, flowRate: rnd(10,150), soilMoisture: rnd(20,75), waterUsedToday: rnd(100,8000), schedule: pk(['Active','Paused']) }
    case 'machine_monitor_unit':
      return { machinesMonitored: ri(2,15), avgVibration: rnd(1,8), faultsToday: ri(0,8), avgHealth: rnd(50,98) }
    case 'water_flow_meter':
      return { flowRate: rnd(30,350), totalVolume: rnd(5000,200000), pressure: rnd(0.5,6), temp: rnd(15,38) }
    case 'generator_monitor':
      return { status: pk(['Running','Standby']), fuelLevel: rnd(15,100), voltage: rnd(380,440), load: rnd(0,90), runHours: rnd(20,5000), temp: rnd(28,100) }
    default:
      return { value: rnd(0,100) }
  }
}

// ────── main generator ──────
export function generateDevices(count = 1000) {
  return Array.from({ length: count }, (_, i) => {
    const type   = TYPE_KEYS[i % TYPE_KEYS.length]
    const t      = TYPES[type]
    const loc    = pk(LOCATIONS)
    const conn   = pk(CONNS)
    const isOn   = Math.random() > 0.08
    const vals   = initValues(type)
    const pv     = vals[t.primary]
    const vl     = VENDORS[type] || ['Generic']
    const fw     = mkFW()
    const lfw    = Math.random() > 0.4 ? mkFW() : fw

    return {
      id:       'dev_' + (_devId++),
      type,
      name:     `${loc.toUpperCase().replace(/\s/g, '-')}-${type.toUpperCase().replace(/_/g, '-')}-${String(i + 1).padStart(4, '0')}`,
      location: loc,
      vendor:   pk(vl),
      conn,
      status:   isOn ? 'online' : 'offline',
      power:    isOn && Math.random() > 0.12 ? 'on' : 'off',
      mode:     'auto',
      fw,
      latestFw: lfw,
      values:   vals,
      history:  Array.from({ length: 24 }, () =>
        Math.max(0, (typeof pv === 'number' ? pv : 50) * rnd(0.8, 1.2))
      ),
      uptime:      rnd(78, 100),
      dailyEnergy: Array.from({ length: 14 }, () => rnd(0, 50)),
    }
  })
}

// ────── Arduino .ino sketch generator ──────
export function generateIno(device) {
  const t = TYPES[device.type]
  return `// ═══════════════════════════════════════════════
// KGP Innovation — Auto-Generated Firmware Sketch
// Device : ${device.name}
// Type   : ${t.label}
// Conn   : ${device.conn}
// Topic  : devices/${device.id}/telemetry
// Built  : ${new Date().toLocaleString()}
// ═══════════════════════════════════════════════

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ── WiFi / APN ──
const char* SSID       = "YOUR_WIFI_SSID";
const char* WIFI_PASS  = "YOUR_WIFI_PASSWORD";

// ── AWS IoT Core ──
const char* AWS_HOST   = "YOUR_ENDPOINT.iot.ap-south-1.amazonaws.com";
const int   AWS_PORT   = 8883;
const char* THING_NAME = "${device.id}";
const char* PUB_TOPIC  = "devices/${device.id}/telemetry";
const char* SUB_TOPIC  = "devices/${device.id}/commands";

// ── TLS Certs (paste PEM from AWS Console) ──
static const char ROOT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
<paste AmazonRootCA1.pem here>
-----END CERTIFICATE-----
)EOF";
static const char CLIENT_CERT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
<paste device certificate here>
-----END CERTIFICATE-----
)EOF";
static const char CLIENT_KEY[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
<paste private key here>
-----END RSA PRIVATE KEY-----
)EOF";

WiFiClientSecure net;
PubSubClient    client(net);

// ── Callback: incoming commands ──
void onMessage(char* topic, byte* payload, unsigned int len) {
  StaticJsonDocument<256> cmd;
  if (deserializeJson(cmd, payload, len) == DeserializationError::Ok) {
    const char* action = cmd["action"];
    if (strcmp(action, "power_on")  == 0) { /* TODO: turn relay on  */ }
    if (strcmp(action, "power_off") == 0) { /* TODO: turn relay off */ }
    if (strcmp(action, "reboot")    == 0) { ESP.restart(); }
  }
}

void connectAWS() {
  net.setCACert(ROOT_CA);
  net.setCertificate(CLIENT_CERT);
  net.setPrivateKey(CLIENT_KEY);
  client.setServer(AWS_HOST, AWS_PORT);
  client.setCallback(onMessage);
  client.setKeepAlive(60);

  while (!client.connected()) {
    Serial.print("Connecting to AWS IoT Core…");
    if (client.connect(THING_NAME)) {
      Serial.println(" connected!");
      client.subscribe(SUB_TOPIC);
    } else {
      Serial.printf(" failed (%d). Retry in 5s\\n", client.state());
      delay(5000);
    }
  }
}

// ── Read sensors — REPLACE with real hardware reads ──
void buildPayload(JsonDocument& doc) {
  doc["device_id"]   = THING_NAME;
  doc["device_type"] = "${device.type}";
  doc["location"]    = "${device.location}";
  doc["ts"]          = millis();
${Object.keys(device.values).slice(0, 6).map((k, i) =>
    `  doc["${k}"] = analogRead(A${i}) / 4095.0 * 100; // TODO: calibrate for ${k}`
  ).join('\n')}
}

// ── setup ──
void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, WIFI_PASS);
  Serial.print("WiFi…");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println(" OK: " + WiFi.localIP().toString());
  connectAWS();
}

// ── loop ──
void loop() {
  if (!client.connected()) connectAWS();
  client.loop();

  static unsigned long last = 0;
  if (millis() - last >= 60000UL) {   // publish every 60 seconds
    last = millis();
    StaticJsonDocument<512> doc;
    buildPayload(doc);
    String payload;
    serializeJson(doc, payload);
    bool ok = client.publish(PUB_TOPIC, payload.c_str(), false);
    Serial.printf("[%lu] publish %s\\n", last, ok ? "OK" : "FAIL");
  }
}
`
}