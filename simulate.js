// ═══════════════════════════════════════════════════
//  Real-Time Simulation Engine
//  Called every 60 s to mutate all device values.
// ═══════════════════════════════════════════════════
import { TYPES } from './types.js'
import { ri } from './generate.js'

// Random walk: clamp value in [mn, mx] with max step d
const rw = (v, d, mn, mx) =>
  Math.max(mn, Math.min(mx, v + (Math.random() - 0.5) * d * 2))

// Tick a single device — returns a new device object
export function tickDevice(d) {
  if (d.status === 'offline') {
    // Small chance to come back online
    if (Math.random() < 0.02) return { ...d, status: 'online', power: 'on' }
    return d
  }

  // Small chance to drop offline
  if (Math.random() < 0.005) return { ...d, status: 'offline', power: 'off' }

  const v = { ...d.values }

  switch (d.type) {
    case 'street_light':
      v.voltage   = rw(v.voltage, 5, 210, 260)
      v.current   = rw(v.current, 0.1, 0, 3)
      v.load      = d.power === 'on' ? v.voltage * v.current : 0
      v.energy   += v.load / 1000 / 60
      v.pf        = rw(v.pf, 0.02, 0.8, 1)
      v.temp      = rw(v.temp, 1, 20, 70)
      break

    case 'smart_meter':
      v.voltage   = rw(v.voltage, 3, 215, 255)
      v.current   = rw(v.current, 0.5, 0, 25)
      v.load      = v.voltage * v.current
      v.energy   += v.load / 1000 / 60
      v.pf        = rw(v.pf, 0.01, 0.85, 1)
      v.freq      = rw(v.freq, 0.05, 49, 51)
      break

    case 'tank':
      v.level     = rw(v.level, 1, 0, 100)
      v.volume    = v.level * 150
      v.temp      = rw(v.temp, 0.5, 15, 45)
      break

    case 'motor':
      if (d.power === 'on') {
        v.rpm       = rw(v.rpm, 50, 0, 3500)
        v.current   = rw(v.current, 0.5, 0, 30)
        v.vibration = rw(v.vibration, 0.2, 0, 10)
        v.temp      = rw(v.temp, 1, 30, 95)
        v.runHours += 1 / 60
      } else { v.rpm = 0; v.current = 0 }
      break

    case 'traffic':
      v.vehicles  = rw(v.vehicles, 20, 0, 500)
      v.health    = rw(v.health, 0.5, 50, 100)
      v.cycle     = rw(v.cycle, 2, 45, 150)
      if (Math.random() < 0.1) v.phase = ['Green','Yellow','Red'][ri(0, 2)]
      break

    case 'parking':
      v.occupied  = Math.max(0, Math.min(v.total, v.occupied + ri(-5, 5)))
      v.available = v.total - v.occupied
      v.occupancy = (v.occupied / v.total) * 100
      v.entries  += ri(0, 5)
      v.exits    += ri(0, 4)
      v.revenue  += Math.random() * 100
      break

    case 'water_quality':
      v.ph        = rw(v.ph, 0.05, 5.5, 9.5)
      v.tds       = rw(v.tds, 5, 50, 1000)
      v.turbidity = rw(v.turbidity, 0.2, 0, 20)
      v.temp      = rw(v.temp, 0.3, 15, 40)
      break

    case 'air_quality':
      v.aqi       = rw(v.aqi, 10, 0, 300)
      v.pm25      = rw(v.pm25, 5, 0, 250)
      v.pm10      = rw(v.pm10, 8, 0, 350)
      v.co2       = rw(v.co2, 15, 300, 1200)
      v.co        = rw(v.co, 0.2, 0, 10)
      v.no2       = rw(v.no2, 3, 0, 150)
      v.temp      = rw(v.temp, 0.5, 15, 45)
      v.humidity  = rw(v.humidity, 1, 20, 95)
      break

    case 'dustbin':
      v.fill      = Math.min(100, v.fill + Math.random() * 0.5)
      v.weight    = v.fill * 0.6
      v.battery   = Math.max(0, v.battery - Math.random() * 0.05)
      if (v.fill >= 100 && Math.random() < 0.05) v.fill = ri(5, 20)  // emptied
      break

    case 'solar':
      if (d.power === 'on') {
        v.panelVoltage  = rw(v.panelVoltage, 10, 200, 480)
        v.panelCurrent  = rw(v.panelCurrent, 0.5, 0, 20)
        v.power         = v.panelVoltage * v.panelCurrent
        v.generated    += v.power / 1000 / 60
      } else { v.power = 0 }
      v.battery = rw(v.battery, 1, 10, 100)
      break

    case 'soil_moisture':
      v.moisture  = rw(v.moisture, 1, 0, 100)
      v.soilTemp  = rw(v.soilTemp, 0.3, 10, 45)
      v.ec        = rw(v.ec, 0.05, 0, 5)
      v.battery   = Math.max(0, v.battery - Math.random() * 0.03)
      break

    case 'weather_station':
      v.temp      = rw(v.temp, 0.5, 10, 50)
      v.humidity  = rw(v.humidity, 1, 20, 100)
      v.rainfall  = Math.max(0, v.rainfall + (Math.random() < 0.2 ? Math.random() * 2 : -Math.random() * 0.5))
      v.windSpeed = rw(v.windSpeed, 2, 0, 60)
      v.pressure  = rw(v.pressure, 0.5, 980, 1040)
      break

    case 'gas_leak':
      v.gasLevel  = rw(v.gasLevel, 15, 0, 600)
      v.status    = v.gasLevel > 400 ? 'Leak Detected' : 'Safe'
      v.temp      = rw(v.temp, 0.5, 20, 55)
      v.battery   = Math.max(0, v.battery - Math.random() * 0.03)
      break

    case 'irrigation_valve':
      if (d.power === 'on') {
        v.flowRate  = rw(v.flowRate, 5, 0, 120)
        v.pressure  = rw(v.pressure, 0.1, 0.5, 6)
        v.totalFlow += v.flowRate / 60
      } else { v.flowRate = 0 }
      break

    case 'ev_charger':
      if (d.power === 'on') {
        v.voltage       = rw(v.voltage, 2, 200, 260)
        v.current       = rw(v.current, 1, 0, 32)
        v.power         = (v.voltage * v.current) / 1000
        v.sessionEnergy += v.power / 60
      } else { v.power = 0; v.current = 0 }
      break

    case 'rain_wind':
      v.rainfall      = Math.max(0, v.rainfall + (Math.random() < 0.2 ? Math.random() * 3 : -Math.random() * 1))
      v.totalRainfall += Math.max(0, v.rainfall) / 60
      v.windSpeed     = rw(v.windSpeed, 3, 0, 80)
      v.windGust      = Math.max(v.windSpeed, rw(v.windGust, 3, 0, 110))
      if (Math.random() < 0.08) v.windDirection = ['N','NE','E','SE','S','SW','W','NW'][ri(0, 7)]
      break

    case 'industrial_machine':
      if (d.power === 'on') {
        v.rpm       = rw(v.rpm, 50, 0, 4000)
        v.current   = rw(v.current, 1, 0, 40)
        v.vibration = rw(v.vibration, 0.3, 0, 12)
        v.temp      = rw(v.temp, 1, 25, 110)
        v.runHours += 1 / 60
        v.health    = rw(v.health, 0.5, 0, 100)
        v.status    = v.vibration > 7 ? 'Fault' : 'Running'
      } else { v.rpm = 0; v.current = 0; v.status = 'Idle' }
      break

    case 'agri_controller':
      v.soilMoisture  = rw(v.soilMoisture, 1, 0, 100)
      v.soilTemp      = rw(v.soilTemp, 0.3, 10, 45)
      v.humidity      = rw(v.humidity, 1, 20, 95)
      v.lightIntensity = rw(v.lightIntensity, 2000, 0, 120000)
      v.pump          = d.power === 'on' ? 'Running' : 'Idle'
      break

    case 'gps_tracker':
      if (d.power === 'on') {
        v.speed     = rw(v.speed, 10, 0, 120)
        v.odometer += v.speed / 60
        v.fuelLevel = Math.max(0, v.fuelLevel - Math.random() * 0.05)
        v.ignition  = 'ON'
      } else { v.speed = 0; v.ignition = 'OFF' }
      break

    case 'building_gateway':
      v.connectedDevices = Math.max(0, v.connectedDevices + ri(-5, 5))
      v.temp             = rw(v.temp, 0.3, 18, 40)
      v.humidity         = rw(v.humidity, 1, 30, 80)
      v.energyLoad       = rw(v.energyLoad, 3, 0, 250)
      v.uptime           = rw(v.uptime, 0.1, 85, 100)
      break

    case 'cctv_gateway':
      v.camerasOnline = Math.max(0, v.camerasOnline + ri(-1, 1))
      v.storageUsed   = Math.min(100, v.storageUsed + Math.random() * 0.1)
      v.bandwidth     = rw(v.bandwidth, 5, 0, 120)
      if (Math.random() < 0.3) v.motionEvents += ri(0, 5)
      break

    case 'fleet_gateway':
      v.vehiclesConnected = Math.max(0, v.vehiclesConnected + ri(-3, 3))
      v.avgSpeed          = rw(v.avgSpeed, 5, 0, 100)
      v.activeTrips       = Math.max(0, v.activeTrips + ri(-2, 2))
      if (Math.random() < 0.05) v.alertsToday += 1
      break

    case 'smart_home':
      v.devicesConnected = Math.max(0, v.devicesConnected + ri(-2, 2))
      v.temp             = rw(v.temp, 0.3, 18, 35)
      v.humidity         = rw(v.humidity, 1, 30, 75)
      v.energyUsage     += Math.random() * 0.05
      break

    case 'fire_alarm_gateway':
      v.batteryBackup = rw(v.batteryBackup, 0.1, 70, 100)
      if (Math.random() < 0.01 && v.activeAlarms === 0) v.activeAlarms = 1
      else if (v.activeAlarms > 0 && Math.random() < 0.3)  v.activeAlarms = 0
      v.status = v.activeAlarms > 0 ? 'Alarm' : 'Normal'
      break

    case 'smoke_detector':
      v.smokeLevel = rw(v.smokeLevel, 3, 0, 60)
      v.temp       = rw(v.temp, 0.3, 15, 65)
      v.battery    = Math.max(0, v.battery - Math.random() * 0.03)
      v.status     = v.smokeLevel > 40 ? 'Smoke Detected' : 'Clear'
      break

    case 'irrigation_controller':
      if (d.power === 'on') {
        v.flowRate       = rw(v.flowRate, 5, 0, 150)
        v.waterUsedToday += v.flowRate / 60
      } else { v.flowRate = 0 }
      v.soilMoisture = rw(v.soilMoisture, 1, 0, 100)
      break

    case 'machine_monitor_unit':
      v.avgVibration = rw(v.avgVibration, 0.3, 0, 12)
      v.avgHealth    = rw(v.avgHealth, 0.5, 0, 100)
      if (Math.random() < 0.02) v.faultsToday += 1
      break

    case 'water_flow_meter':
      if (d.power === 'on') {
        v.flowRate    = rw(v.flowRate, 10, 0, 400)
        v.totalVolume += v.flowRate / 60
        v.pressure    = rw(v.pressure, 0.2, 0, 8)
      } else { v.flowRate = 0 }
      v.temp = rw(v.temp, 0.2, 10, 40)
      break

    case 'generator_monitor':
      if (d.power === 'on') {
        v.load     = rw(v.load, 3, 0, 100)
        v.voltage  = rw(v.voltage, 2, 370, 450)
        v.runHours += 1 / 60
        v.fuelLevel = Math.max(0, v.fuelLevel - Math.random() * 0.03)
        v.temp     = rw(v.temp, 1, 30, 120)
        v.status   = 'Running'
      } else { v.status = 'Standby'; v.load = 0 }
      break

    default: break
  }

  // Update history ring-buffer
  const t  = TYPES[d.type]
  const pv = v[t.primary]
  const nh = typeof pv === 'number'
    ? [...d.history.slice(1), parseFloat(pv.toFixed(2))]
    : d.history

  return { ...d, values: v, history: nh }
}

// Tick the whole fleet in one pass
export function tickFleet(devices) {
  return devices.map(tickDevice)
}