// ═══════════════════════════════════════════════════
//  KGP Innovation — 29 Device Type Registry
// ═══════════════════════════════════════════════════

const PALETTE_C = [
  '#DB8B12','#4F6EF7','#0891B2','#7C5CE0','#E4483C','#0FA968',
  '#0EA5E9','#EA580C','#65A30D','#CA8A04','#059669','#6366F1',
  '#DB2777','#0D9488','#9333EA','#F59E0B','#2563EB','#16A34A',
  '#DC2626','#7C3AED','#0284C7','#B45309','#047857','#4338CA',
  '#BE185D','#0F766E','#7E22CE','#92400E','#1D4ED8',
]
const PALETTE_B = [
  '#FDF3E0','#EEF1FE','#E4F6FA','#F1ECFC','#FDECEB','#E7F8F0',
  '#E0F5FE','#FEEBDD','#EEF7DC','#FBF0D6','#DCF6EC','#E7E8FD',
  '#FCE4F0','#DDF6F1','#F3E6FC','#FEF3D6','#DBEAFE','#DCFCE7',
  '#FEE2E2','#EDE9FE','#E0F2FE','#FEF3C7','#D1FAE5','#E0E7FF',
  '#FCE7F3','#CCFBF1','#F3E8FF','#FEF9C3','#DBEAFE',
]

export const TYPES = {
  street_light:         { label: 'Street Light',              icon: '💡',  primary: 'load',              unit: 'W',     alertHigh: null, alertLow: null, controllable: true,  energy: true },
  smart_meter:          { label: 'Smart Meter',               icon: '🔢',  primary: 'load',              unit: 'W',     controllable: true,  energy: true },
  tank:                 { label: 'Tank Level Indicator',      icon: '🛢️',  primary: 'level',             unit: '%',     alertLow: 20 },
  motor:                { label: 'Motor Controller',          icon: '⚙️',  primary: 'rpm',               unit: 'RPM',   alertHigh: null, controllable: true },
  traffic:              { label: 'Traffic Signal Monitor',    icon: '🚦',  primary: 'vehicles',          unit: '/hr',   controllable: true },
  parking:              { label: 'Smart Parking System',      icon: '🅿️',  primary: 'occupancy',         unit: '%',     alertHigh: 90 },
  water_quality:        { label: 'Water Quality Tester',      icon: '💧',  primary: 'ph',                unit: 'pH',    alertLow: 6.5, alertHigh: 8.5 },
  air_quality:          { label: 'Air Quality Station',       icon: '🌫️',  primary: 'aqi',               unit: 'AQI',   alertHigh: 150 },
  dustbin:              { label: 'Smart Dustbin',             icon: '🗑️',  primary: 'fill',              unit: '%',     alertHigh: 85 },
  solar:                { label: 'Solar Analyzer',            icon: '☀️',  primary: 'power',             unit: 'W',     controllable: true, energy: true },
  soil_moisture:        { label: 'Soil Moisture Sensor',      icon: '🌱',  primary: 'moisture',          unit: '%',     alertLow: 25 },
  weather_station:      { label: 'Weather Monitoring Station',icon: '⛅',  primary: 'temp',              unit: '°C' },
  gas_leak:             { label: 'Gas Leak Detector',         icon: '🧯',  primary: 'gasLevel',          unit: 'ppm',   alertHigh: 400 },
  irrigation_valve:     { label: 'Smart Irrigation Valve',    icon: '🚿',  primary: 'flowRate',          unit: 'L/min', controllable: true },
  ev_charger:           { label: 'EV Charging Station',       icon: '🔌',  primary: 'power',             unit: 'kW',    controllable: true, energy: true },
  rain_wind:            { label: 'Rain & Wind Station',       icon: '🌬️',  primary: 'windSpeed',         unit: 'km/h',  alertHigh: 60 },
  industrial_machine:   { label: 'Industrial Machine Monitor',icon: '🏭',  primary: 'vibration',         unit: 'mm/s',  alertHigh: 7,  controllable: true },
  agri_controller:      { label: 'Smart Agriculture Controller',icon:'🌾', primary: 'soilMoisture',      unit: '%',     alertLow: 20,  controllable: true },
  gps_tracker:          { label: 'GPS Vehicle Tracker',       icon: '🛰️',  primary: 'speed',             unit: 'km/h',  controllable: true },
  building_gateway:     { label: 'Smart Building Gateway',    icon: '🏢',  primary: 'connectedDevices',  unit: '' },
  cctv_gateway:         { label: 'CCTV Gateway',              icon: '📹',  primary: 'camerasOnline',     unit: '',      controllable: true },
  fleet_gateway:        { label: 'Fleet Gateway',             icon: '🚚',  primary: 'vehiclesConnected', unit: '' },
  smart_home:           { label: 'Smart Home Controller',     icon: '🏠',  primary: 'devicesConnected',  unit: '',      controllable: true },
  fire_alarm_gateway:   { label: 'Fire Alarm Gateway',        icon: '🚨',  primary: 'activeAlarms',      unit: '',      alertHigh: 0 },
  smoke_detector:       { label: 'Smoke Detector',            icon: '🔥',  primary: 'smokeLevel',        unit: '%',     alertHigh: 40 },
  irrigation_controller:{ label: 'Smart Irrigation Controller',icon:'💦',  primary: 'flowRate',          unit: 'L/min', controllable: true },
  machine_monitor_unit: { label: 'Machine Monitor Unit',      icon: '🧰',  primary: 'avgHealth',         unit: '%',     alertLow: 60 },
  water_flow_meter:     { label: 'Water Flow Meter',          icon: '🚰',  primary: 'flowRate',          unit: 'L/min', controllable: true },
  generator_monitor:    { label: 'Generator Monitor',         icon: '🔋',  primary: 'load',              unit: '%',     alertLow: 15,  controllable: true },
}

// Assign palette colors to each type
const typeKeys = Object.keys(TYPES)
typeKeys.forEach((k, i) => {
  TYPES[k].color = PALETTE_C[i % PALETTE_C.length]
  TYPES[k].bg    = PALETTE_B[i % PALETTE_B.length]
})

export const TYPE_KEYS = typeKeys

// Detailed metrics per type (shown in detail view)
export const TYPE_METRICS = {
  street_light:         [{k:'voltage',l:'Voltage',u:'V'},{k:'current',l:'Current',u:'A'},{k:'load',l:'Power Load',u:'W'},{k:'energy',l:'Energy',u:'kWh'},{k:'pf',l:'Power Factor',u:''},{k:'temp',l:'Temperature',u:'°C'}],
  smart_meter:          [{k:'voltage',l:'Voltage',u:'V'},{k:'current',l:'Current',u:'A'},{k:'load',l:'Load',u:'W'},{k:'energy',l:'Energy',u:'kWh'},{k:'pf',l:'Power Factor',u:''},{k:'freq',l:'Frequency',u:'Hz'}],
  tank:                 [{k:'level',l:'Water Level',u:'%'},{k:'volume',l:'Volume',u:'L'},{k:'temp',l:'Temperature',u:'°C'},{k:'pump',l:'Pump Status',u:''}],
  motor:                [{k:'voltage',l:'Voltage',u:'V'},{k:'current',l:'Current',u:'A'},{k:'rpm',l:'Speed',u:'RPM'},{k:'vibration',l:'Vibration',u:'mm/s'},{k:'temp',l:'Winding Temp',u:'°C'},{k:'runHours',l:'Run Hours',u:'h'}],
  traffic:              [{k:'phase',l:'Current Phase',u:''},{k:'cycle',l:'Cycle Time',u:'s'},{k:'vehicles',l:'Vehicle Count',u:'/hr'},{k:'health',l:'Signal Health',u:'%'}],
  parking:              [{k:'total',l:'Total Slots',u:''},{k:'occupied',l:'Occupied',u:''},{k:'available',l:'Available',u:''},{k:'occupancy',l:'Occupancy',u:'%'},{k:'entries',l:'Entries Today',u:''},{k:'exits',l:'Exits Today',u:''},{k:'avgDuration',l:'Avg Stay',u:'min'},{k:'revenue',l:'Revenue',u:'₹'}],
  water_quality:        [{k:'ph',l:'pH Level',u:''},{k:'tds',l:'TDS',u:'ppm'},{k:'turbidity',l:'Turbidity',u:'NTU'},{k:'temp',l:'Temperature',u:'°C'}],
  air_quality:          [{k:'aqi',l:'AQI',u:''},{k:'pm25',l:'PM2.5',u:'µg/m³'},{k:'pm10',l:'PM10',u:'µg/m³'},{k:'co2',l:'CO₂',u:'ppm'},{k:'co',l:'CO',u:'ppm'},{k:'no2',l:'NO₂',u:'ppb'},{k:'so2',l:'SO₂',u:'ppb'},{k:'temp',l:'Temp',u:'°C'},{k:'humidity',l:'Humidity',u:'%'}],
  dustbin:              [{k:'fill',l:'Fill Level',u:'%'},{k:'weight',l:'Weight',u:'kg'},{k:'lid',l:'Lid Status',u:''},{k:'battery',l:'Battery',u:'%'}],
  solar:                [{k:'panelVoltage',l:'Panel Voltage',u:'V'},{k:'panelCurrent',l:'Panel Current',u:'A'},{k:'power',l:'Output Power',u:'W'},{k:'generated',l:'Generated Today',u:'kWh'},{k:'battery',l:'Battery',u:'%'}],
  soil_moisture:        [{k:'moisture',l:'Soil Moisture',u:'%'},{k:'soilTemp',l:'Soil Temp',u:'°C'},{k:'ec',l:'Conductivity (EC)',u:'mS/cm'},{k:'battery',l:'Battery',u:'%'}],
  weather_station:      [{k:'temp',l:'Temperature',u:'°C'},{k:'humidity',l:'Humidity',u:'%'},{k:'rainfall',l:'Rainfall',u:'mm'},{k:'windSpeed',l:'Wind Speed',u:'km/h'},{k:'pressure',l:'Pressure',u:'hPa'}],
  gas_leak:             [{k:'gasLevel',l:'Gas Concentration',u:'ppm'},{k:'status',l:'Status',u:''},{k:'temp',l:'Temperature',u:'°C'},{k:'battery',l:'Battery',u:'%'}],
  irrigation_valve:     [{k:'flowRate',l:'Flow Rate',u:'L/min'},{k:'valveStatus',l:'Valve Status',u:''},{k:'pressure',l:'Line Pressure',u:'bar'},{k:'totalFlow',l:'Total Flow Today',u:'L'}],
  ev_charger:           [{k:'voltage',l:'Voltage',u:'V'},{k:'current',l:'Current',u:'A'},{k:'power',l:'Charging Power',u:'kW'},{k:'sessionEnergy',l:'Session Energy',u:'kWh'},{k:'connector',l:'Connector',u:''}],
  rain_wind:            [{k:'rainfall',l:'Rainfall Intensity',u:'mm/hr'},{k:'totalRainfall',l:'Total Rainfall',u:'mm'},{k:'windSpeed',l:'Wind Speed',u:'km/h'},{k:'windGust',l:'Wind Gust',u:'km/h'},{k:'windDirection',l:'Wind Direction',u:''}],
  industrial_machine:   [{k:'status',l:'Machine Status',u:''},{k:'rpm',l:'Speed',u:'RPM'},{k:'current',l:'Current Draw',u:'A'},{k:'vibration',l:'Vibration',u:'mm/s'},{k:'temp',l:'Machine Temp',u:'°C'},{k:'health',l:'Health Score',u:'%'},{k:'runHours',l:'Run Hours',u:'h'}],
  agri_controller:      [{k:'soilMoisture',l:'Soil Moisture',u:'%'},{k:'soilTemp',l:'Soil Temp',u:'°C'},{k:'humidity',l:'Humidity',u:'%'},{k:'lightIntensity',l:'Light Intensity',u:'lux'},{k:'pump',l:'Pump Status',u:''}],
  gps_tracker:          [{k:'speed',l:'Speed',u:'km/h'},{k:'fuelLevel',l:'Fuel Level',u:'%'},{k:'ignition',l:'Ignition',u:''},{k:'odometer',l:'Odometer',u:'km'},{k:'location',l:'Location',u:''}],
  building_gateway:     [{k:'connectedDevices',l:'Connected Devices',u:''},{k:'temp',l:'Avg Temperature',u:'°C'},{k:'humidity',l:'Avg Humidity',u:'%'},{k:'energyLoad',l:'Energy Load',u:'kW'},{k:'uptime',l:'Gateway Uptime',u:'%'}],
  cctv_gateway:         [{k:'camerasOnline',l:'Cameras Online',u:''},{k:'storageUsed',l:'Storage Used',u:'%'},{k:'bandwidth',l:'Bandwidth',u:'Mbps'},{k:'motionEvents',l:'Motion Events Today',u:''},{k:'recording',l:'Recording Status',u:''}],
  fleet_gateway:        [{k:'vehiclesConnected',l:'Vehicles Connected',u:''},{k:'avgSpeed',l:'Avg Fleet Speed',u:'km/h'},{k:'activeTrips',l:'Active Trips',u:''},{k:'alertsToday',l:'Alerts Today',u:''}],
  smart_home:           [{k:'devicesConnected',l:'Connected Devices',u:''},{k:'temp',l:'Temperature',u:'°C'},{k:'humidity',l:'Humidity',u:'%'},{k:'energyUsage',l:'Energy Usage',u:'kWh'},{k:'mode',l:'Mode',u:''}],
  fire_alarm_gateway:   [{k:'zonesMonitored',l:'Zones Monitored',u:''},{k:'activeAlarms',l:'Active Alarms',u:''},{k:'batteryBackup',l:'Battery Backup',u:'%'},{k:'status',l:'System Status',u:''}],
  smoke_detector:       [{k:'smokeLevel',l:'Smoke Level',u:'%'},{k:'temp',l:'Temperature',u:'°C'},{k:'battery',l:'Battery',u:'%'},{k:'status',l:'Status',u:''}],
  irrigation_controller:[{k:'activeZone',l:'Active Zone',u:''},{k:'flowRate',l:'Flow Rate',u:'L/min'},{k:'soilMoisture',l:'Soil Moisture',u:'%'},{k:'waterUsedToday',l:'Water Used Today',u:'L'},{k:'schedule',l:'Schedule Status',u:''}],
  machine_monitor_unit: [{k:'machinesMonitored',l:'Machines Monitored',u:''},{k:'avgVibration',l:'Avg Vibration',u:'mm/s'},{k:'faultsToday',l:'Faults Today',u:''},{k:'avgHealth',l:'Avg Machine Health',u:'%'}],
  water_flow_meter:     [{k:'flowRate',l:'Flow Rate',u:'L/min'},{k:'totalVolume',l:'Total Volume',u:'L'},{k:'pressure',l:'Line Pressure',u:'bar'},{k:'temp',l:'Water Temp',u:'°C'}],
  generator_monitor:    [{k:'status',l:'Status',u:''},{k:'fuelLevel',l:'Fuel Level',u:'%'},{k:'voltage',l:'Output Voltage',u:'V'},{k:'load',l:'Load',u:'%'},{k:'runHours',l:'Run Hours',u:'h'},{k:'temp',l:'Engine Temp',u:'°C'}],
}

export function typeInfo(type) {
  return TYPES[type] || TYPES.street_light
}