import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ═══════════════════════════════════════════════════════════════════
//  1. DEVICE TYPE REGISTRY — 29 types (full spec from client HTML)
// ═══════════════════════════════════════════════════════════════════
const PC = ['#DB8B12','#4F6EF7','#0891B2','#7C5CE0','#E4483C','#0FA968','#0EA5E9','#EA580C','#65A30D','#CA8A04','#059669','#6366F1','#DB2777','#0D9488','#9333EA','#F59E0B','#2563EB','#16A34A','#DC2626','#7C3AED','#0284C7','#B45309','#047857','#4338CA','#BE185D','#0F766E','#7E22CE','#92400E','#1D4ED8'];
const PB = ['#FDF3E0','#EEF1FE','#E4F6FA','#F1ECFC','#FDECEB','#E7F8F0','#E0F5FE','#FEEBDD','#EEF7DC','#FBF0D6','#DCF6EC','#E7E8FD','#FCE4F0','#DDF6F1','#F3E6FC','#FEF3D6','#DBEAFE','#DCFCE7','#FEE2E2','#EDE9FE','#E0F2FE','#FEF3C7','#D1FAE5','#E0E7FF','#FCE7F3','#CCFBF1','#F3E8FF','#FEF9C3','#DBEAFE'];

const TYPES = {
  street_light:       {label:'Street Light',icon:'💡',primary:'load',unit:'W',alertHigh:null,alertLow:null,controllable:true,energy:true},
  smart_meter:        {label:'Smart Meter',icon:'🔢',primary:'load',unit:'W',controllable:true,energy:true},
  tank:               {label:'Tank Level Indicator',icon:'🛢️',primary:'level',unit:'%',alertLow:20},
  motor:              {label:'Motor Controller',icon:'⚙️',primary:'rpm',unit:'RPM',alertHigh:null,controllable:true},
  traffic:            {label:'Traffic Signal Monitor',icon:'🚦',primary:'vehicles',unit:'/hr',controllable:true},
  parking:            {label:'Smart Parking System',icon:'🅿️',primary:'occupancy',unit:'%',alertHigh:90},
  water_quality:      {label:'Water Quality Tester',icon:'💧',primary:'ph',unit:'pH',alertLow:6.5,alertHigh:8.5},
  air_quality:        {label:'Air Quality Station',icon:'🌫️',primary:'aqi',unit:'AQI',alertHigh:150},
  dustbin:            {label:'Smart Dustbin',icon:'🗑️',primary:'fill',unit:'%',alertHigh:85},
  solar:              {label:'Solar Analyzer',icon:'☀️',primary:'power',unit:'W',controllable:true,energy:true},
  soil_moisture:      {label:'Soil Moisture Sensor',icon:'🌱',primary:'moisture',unit:'%',alertLow:25},
  weather_station:    {label:'Weather Monitoring Station',icon:'⛅',primary:'temp',unit:'°C'},
  gas_leak:           {label:'Gas Leak Detector',icon:'🧯',primary:'gasLevel',unit:'ppm',alertHigh:400},
  irrigation_valve:   {label:'Smart Irrigation Valve',icon:'🚿',primary:'flowRate',unit:'L/min',controllable:true},
  ev_charger:         {label:'EV Charging Station',icon:'🔌',primary:'power',unit:'kW',controllable:true,energy:true},
  rain_wind:          {label:'Rain & Wind Station',icon:'🌬️',primary:'windSpeed',unit:'km/h',alertHigh:60},
  industrial_machine: {label:'Industrial Machine Monitor',icon:'🏭',primary:'vibration',unit:'mm/s',alertHigh:7,controllable:true},
  agri_controller:    {label:'Smart Agriculture Controller',icon:'🌾',primary:'soilMoisture',unit:'%',alertLow:20,controllable:true},
  gps_tracker:        {label:'GPS Vehicle Tracker',icon:'🛰️',primary:'speed',unit:'km/h',controllable:true},
  building_gateway:   {label:'Smart Building Gateway',icon:'🏢',primary:'connectedDevices',unit:''},
  cctv_gateway:       {label:'CCTV Gateway',icon:'📹',primary:'camerasOnline',unit:'',controllable:true},
  fleet_gateway:      {label:'Fleet Gateway',icon:'🚚',primary:'vehiclesConnected',unit:''},
  smart_home:         {label:'Smart Home Controller',icon:'🏠',primary:'devicesConnected',unit:'',controllable:true},
  fire_alarm_gateway: {label:'Fire Alarm Gateway',icon:'🚨',primary:'activeAlarms',unit:'',alertHigh:0},
  smoke_detector:     {label:'Smoke Detector',icon:'🔥',primary:'smokeLevel',unit:'%',alertHigh:40},
  irrigation_controller:{label:'Smart Irrigation Controller',icon:'💦',primary:'flowRate',unit:'L/min',controllable:true},
  machine_monitor_unit:{label:'Machine Monitor Unit',icon:'🧰',primary:'avgHealth',unit:'%',alertLow:60},
  water_flow_meter:   {label:'Water Flow Meter',icon:'🚰',primary:'flowRate',unit:'L/min',controllable:true},
  generator_monitor:  {label:'Generator Monitor',icon:'🔋',primary:'load',unit:'%',alertLow:15,controllable:true},
};
const TK = Object.keys(TYPES);
TK.forEach((k,i)=>{ TYPES[k].color=PC[i%PC.length]; TYPES[k].bg=PB[i%PB.length]; });

// ═══════════════════════════════════════════════════════════════════
//  2. GENERATION
// ═══════════════════════════════════════════════════════════════════
const LOCS = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur','Lucknow','Bhimavaram','Palakollu','Tadepalligudem','Narsapur','Undi','Vijayawada','Visakhapatnam','Guntur','Kakinada','Eluru','Rajkot','Surat','Indore','Bhopal','Nagpur','Nashik','Coimbatore','Madurai','Kochi','Thiruvananthapuram'];
const VM = {
  street_light:['Signify','GE Lighting','Havells','Bajaj Electricals'],smart_meter:['L&T','Secure Meters','Genus','Landis+Gyr'],tank:['AquaSense','WaterTech','Grundfos'],motor:['Kirloskar','ABB','Siemens','WEG'],traffic:['Q-Free','Siemens','Yunex'],parking:['ParkSmart','Bosch','Swarco'],water_quality:['HydroLab','YSI','Hach'],air_quality:['AirSense','Vaisala','Aeroqual'],dustbin:['CleanTech','Bigbelly','Nordsense'],solar:['Luminous','Delta','SMA','Fronius'],soil_moisture:['AgroSense','Campbell','Davis'],weather_station:['Davis Instruments','Vaisala','Campbell'],gas_leak:['SafeAir','Honeywell','MSA'],irrigation_valve:['AgroSense','Rain Bird','Hunter'],ev_charger:['Exicom','ABB','Schneider'],rain_wind:['Davis Instruments','Vaisala','Gill'],industrial_machine:['Siemens','ABB','FANUC'],agri_controller:['AgroSense','Netafim','Lindsay'],gps_tracker:['Concox','Teltonika','Queclink'],building_gateway:['Honeywell','Johnson Controls','Siemens'],cctv_gateway:['Hikvision','Dahua','Axis'],fleet_gateway:['Concox','Teltonika','Geotab'],smart_home:['Google Nest','Amazon Echo','Samsung SmartThings'],fire_alarm_gateway:['Honeywell','Siemens','Notifier'],smoke_detector:['Honeywell','Kidde','First Alert'],irrigation_controller:['AgroSense','Rain Bird','Toro'],machine_monitor_unit:['Siemens','Emerson','Fluke'],water_flow_meter:['Itron','Badger Meter','Kamstrup'],generator_monitor:['Cummins','Caterpillar','Kohler'],
};
const CONNS = ['WiFi','LTE','4G','NB-IoT'];
let _did = 1;
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.round(rnd(a,b));
const pk=a=>a[Math.floor(Math.random()*a.length)];
const mkFW=()=>`v${ri(1,5)}.${ri(0,9)}.${ri(0,9)}`;

function initV(type){
  switch(type){
    case 'street_light':    return {voltage:rnd(220,250),current:rnd(0,2.5),load:rnd(0,500),energy:rnd(50,300),pf:rnd(0.85,1),temp:rnd(28,55)};
    case 'smart_meter':     return {voltage:rnd(220,250),current:rnd(1,20),load:rnd(200,5000),energy:rnd(100,2000),pf:rnd(0.88,0.99),freq:rnd(49.5,50.5)};
    case 'tank':            return {level:rnd(15,95),volume:rnd(500,15000),temp:rnd(20,38),pump:pk(['Running','Idle'])};
    case 'motor':           return {voltage:rnd(380,440),current:rnd(4,25),rpm:rnd(800,3000),vibration:rnd(0.5,6),temp:rnd(35,85),runHours:rnd(0,15000)};
    case 'traffic':         return {phase:pk(['Green','Yellow','Red']),cycle:rnd(60,120),vehicles:rnd(30,350),health:rnd(70,100)};
    case 'parking':         {const t=ri(50,300),o=ri(0,t);return{total:t,occupied:o,available:t-o,occupancy:o/t*100,entries:ri(50,600),exits:ri(40,580),avgDuration:rnd(20,150),revenue:rnd(500,15000)};}
    case 'water_quality':   return {ph:rnd(6.2,8.8),tds:rnd(100,900),turbidity:rnd(0.5,15),temp:rnd(18,35)};
    case 'air_quality':     return {aqi:rnd(20,250),pm25:rnd(5,200),pm10:rnd(10,300),co2:rnd(350,1000),co:rnd(0.1,8),no2:rnd(5,120),so2:rnd(2,100),o3:rnd(10,100),temp:rnd(20,42),humidity:rnd(30,85)};
    case 'dustbin':         return {fill:rnd(5,95),weight:rnd(2,60),lid:pk(['Open','Closed']),battery:rnd(15,100)};
    case 'solar':           return {panelVoltage:rnd(300,460),panelCurrent:rnd(3,18),power:rnd(100,8000),generated:rnd(2,40),battery:rnd(30,100)};
    case 'soil_moisture':   return {moisture:rnd(15,85),soilTemp:rnd(18,40),ec:rnd(0.3,4),battery:rnd(20,100)};
    case 'weather_station': return {temp:rnd(18,48),humidity:rnd(25,95),rainfall:rnd(0,25),windSpeed:rnd(0,50),pressure:rnd(990,1030)};
    case 'gas_leak':        return {gasLevel:rnd(0,250),status:'Safe',temp:rnd(22,50),battery:rnd(30,100)};
    case 'irrigation_valve':return {flowRate:rnd(0,100),valveStatus:pk(['Open','Closed']),pressure:rnd(0.5,5),totalFlow:rnd(200,8000)};
    case 'ev_charger':      return {voltage:rnd(210,250),current:rnd(6,32),power:rnd(1.5,22),sessionEnergy:rnd(5,80),connector:pk(['Connected','Idle'])};
    case 'rain_wind':       return {rainfall:rnd(0,25),totalRainfall:rnd(5,100),windSpeed:rnd(0,60),windGust:rnd(5,90),windDirection:pk(['N','NE','E','SE','S','SW','W','NW'])};
    case 'industrial_machine':return{status:'Running',rpm:rnd(800,3500),current:rnd(5,35),vibration:rnd(0.5,9),temp:rnd(30,100),health:rnd(55,100),runHours:rnd(100,20000)};
    case 'agri_controller': return {soilMoisture:rnd(15,80),soilTemp:rnd(18,42),humidity:rnd(35,85),lightIntensity:rnd(2000,100000),pump:pk(['Running','Idle'])};
    case 'gps_tracker':     return {speed:rnd(0,100),fuelLevel:rnd(10,100),ignition:pk(['ON','OFF']),odometer:rnd(1000,150000),location:'NH-16'};
    case 'building_gateway':return{connectedDevices:ri(10,300),temp:rnd(18,35),humidity:rnd(35,70),energyLoad:rnd(5,200),uptime:rnd(90,100)};
    case 'cctv_gateway':    return{camerasOnline:ri(2,32),storageUsed:rnd(20,95),bandwidth:rnd(5,100),motionEvents:ri(50,800),recording:'Active'};
    case 'fleet_gateway':   return{vehiclesConnected:ri(5,80),avgSpeed:rnd(20,80),activeTrips:ri(2,40),alertsToday:ri(0,15)};
    case 'smart_home':      return{devicesConnected:ri(5,50),temp:rnd(19,32),humidity:rnd(35,70),energyUsage:rnd(2,25),mode:'Home'};
    case 'fire_alarm_gateway':return{zonesMonitored:ri(4,24),activeAlarms:Math.random()>0.98?1:0,batteryBackup:rnd(75,100),status:'Normal'};
    case 'smoke_detector':  return{smokeLevel:rnd(0,25),temp:rnd(18,45),battery:rnd(30,100),status:'Clear'};
    case 'irrigation_controller':return{activeZone:`Zone ${ri(1,8)}`,flowRate:rnd(10,150),soilMoisture:rnd(20,75),waterUsedToday:rnd(100,8000),schedule:pk(['Active','Paused'])};
    case 'machine_monitor_unit':return{machinesMonitored:ri(2,15),avgVibration:rnd(1,8),faultsToday:ri(0,8),avgHealth:rnd(50,98)};
    case 'water_flow_meter':return{flowRate:rnd(30,350),totalVolume:rnd(5000,200000),pressure:rnd(0.5,6),temp:rnd(15,38)};
    case 'generator_monitor':return{status:pk(['Running','Standby']),fuelLevel:rnd(15,100),voltage:rnd(380,440),load:rnd(0,90),runHours:rnd(20,5000),temp:rnd(28,100)};
    default:return{value:rnd(0,100)};
  }
}

function genDevices(count=1000){
  return Array.from({length:count},(_,i)=>{
    const type=TK[i%TK.length];
    const t=TYPES[type];
    const loc=pk(LOCS);
    const conn=pk(CONNS);
    const on=Math.random()>0.08;
    const vals=initV(type);
    const pv=vals[t.primary];
    const vl=VM[type]||['Generic'];
    const fw=mkFW(),lfw=Math.random()>0.4?mkFW():fw;
    return{
      id:'dev_'+(_did++),type,
      name:`${loc.toUpperCase().replace(/\s/g,'-')}-${type.toUpperCase().replace(/_/g,'-')}-${String(i+1).padStart(4,'0')}`,
      location:loc,vendor:pk(vl),conn,
      status:on?'online':'offline',
      power:on&&Math.random()>0.12?'on':'off',
      mode:'auto',fw,latestFw:lfw,
      values:vals,
      history:Array.from({length:24},()=>Math.max(0,(typeof pv==='number'?pv:50)*rnd(0.8,1.2))),
      uptime:rnd(78,100),
      dailyEnergy:Array.from({length:14},()=>rnd(0,50)),
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
//  3. SIMULATION TICK (called every 60s)
// ═══════════════════════════════════════════════════════════════════
const rw=(v,d,mn,mx)=>Math.max(mn,Math.min(mx,v+(Math.random()-0.5)*d*2));

function tickDev(d){
  if(d.status==='offline')return d;
  const v={...d.values};
  switch(d.type){
    case 'street_light': v.voltage=rw(v.voltage,5,210,260);v.current=rw(v.current,0.1,0,3);v.load=d.power==='on'?v.voltage*v.current:0;v.energy+=v.load/1000/60;v.pf=rw(v.pf,0.02,0.8,1);v.temp=rw(v.temp,1,20,70);break;
    case 'smart_meter': v.voltage=rw(v.voltage,3,215,255);v.current=rw(v.current,0.5,0,25);v.load=v.voltage*v.current;v.energy+=v.load/1000/60;v.pf=rw(v.pf,0.01,0.85,1);v.freq=rw(v.freq,0.05,49,51);break;
    case 'tank': v.level=rw(v.level,1,0,100);v.volume=v.level*100;v.temp=rw(v.temp,0.5,15,45);break;
    case 'motor': if(d.power==='on'){v.rpm=rw(v.rpm,50,0,3500);v.current=rw(v.current,0.5,0,30);v.vibration=rw(v.vibration,0.2,0,10);v.temp=rw(v.temp,1,30,95);v.runHours+=1/60;}else{v.rpm=0;v.current=0;}break;
    case 'traffic': v.vehicles=rw(v.vehicles,20,0,500);v.health=rw(v.health,0.5,50,100);v.cycle=rw(v.cycle,2,45,150);break;
    case 'parking': v.occupied=Math.max(0,Math.min(v.total,v.occupied+ri(-5,5)));v.available=v.total-v.occupied;v.occupancy=v.occupied/v.total*100;v.entries+=ri(0,5);v.exits+=ri(0,4);v.revenue+=rnd(0,100);break;
    case 'water_quality': v.ph=rw(v.ph,0.05,5.5,9.5);v.tds=rw(v.tds,5,50,1000);v.turbidity=rw(v.turbidity,0.2,0,20);v.temp=rw(v.temp,0.3,15,40);break;
    case 'air_quality': v.aqi=rw(v.aqi,10,0,300);v.pm25=rw(v.pm25,5,0,250);v.pm10=rw(v.pm10,8,0,350);v.co2=rw(v.co2,15,300,1200);v.temp=rw(v.temp,0.5,15,45);v.humidity=rw(v.humidity,1,20,95);break;
    case 'dustbin': v.fill=Math.min(100,v.fill+rnd(0,0.5));v.weight=v.fill*0.6;v.battery=Math.max(0,v.battery-rnd(0,0.05));break;
    case 'solar': if(d.power==='on'){v.panelVoltage=rw(v.panelVoltage,10,200,480);v.panelCurrent=rw(v.panelCurrent,0.5,0,20);v.power=v.panelVoltage*v.panelCurrent;v.generated+=v.power/1000/60;}v.battery=rw(v.battery,1,10,100);break;
    case 'soil_moisture': v.moisture=rw(v.moisture,1,0,100);v.soilTemp=rw(v.soilTemp,0.3,10,45);v.ec=rw(v.ec,0.05,0,5);v.battery=Math.max(0,v.battery-rnd(0,0.03));break;
    case 'weather_station': v.temp=rw(v.temp,0.5,10,50);v.humidity=rw(v.humidity,1,20,100);v.rainfall=Math.max(0,v.rainfall+(Math.random()<0.2?rnd(0,2):-rnd(0,0.5)));v.windSpeed=rw(v.windSpeed,2,0,60);v.pressure=rw(v.pressure,0.5,980,1040);break;
    case 'gas_leak': v.gasLevel=rw(v.gasLevel,15,0,600);v.status=v.gasLevel>400?'Leak Detected':'Safe';v.temp=rw(v.temp,0.5,20,55);v.battery=Math.max(0,v.battery-rnd(0,0.03));break;
    case 'irrigation_valve': if(d.power==='on'){v.flowRate=rw(v.flowRate,5,0,120);v.pressure=rw(v.pressure,0.1,0.5,6);v.totalFlow+=v.flowRate/60;}else{v.flowRate=0;}break;
    case 'ev_charger': if(d.power==='on'){v.voltage=rw(v.voltage,2,200,260);v.current=rw(v.current,1,0,32);v.power=v.voltage*v.current/1000;v.sessionEnergy+=v.power/60;}else{v.power=0;}break;
    case 'rain_wind': v.rainfall=Math.max(0,v.rainfall+(Math.random()<0.2?rnd(0,3):-rnd(0,1)));v.totalRainfall+=Math.max(0,v.rainfall)/60;v.windSpeed=rw(v.windSpeed,3,0,80);v.windGust=Math.max(v.windSpeed,rw(v.windGust,3,0,110));break;
    case 'industrial_machine': if(d.power==='on'){v.rpm=rw(v.rpm,50,0,4000);v.current=rw(v.current,1,0,40);v.vibration=rw(v.vibration,0.3,0,12);v.temp=rw(v.temp,1,25,110);v.runHours+=1/60;v.health=rw(v.health,0.5,0,100);}break;
    case 'agri_controller': v.soilMoisture=rw(v.soilMoisture,1,0,100);v.soilTemp=rw(v.soilTemp,0.3,10,45);v.humidity=rw(v.humidity,1,20,95);v.lightIntensity=rw(v.lightIntensity,2000,0,120000);break;
    case 'gps_tracker': if(d.power==='on'){v.speed=rw(v.speed,10,0,120);v.odometer+=v.speed/60;v.fuelLevel=Math.max(0,v.fuelLevel-rnd(0,0.05));}else{v.speed=0;}break;
    case 'building_gateway': v.connectedDevices=Math.max(0,ri(-5,5)+v.connectedDevices);v.temp=rw(v.temp,0.3,18,40);v.humidity=rw(v.humidity,1,30,80);v.energyLoad=rw(v.energyLoad,3,0,250);v.uptime=rw(v.uptime,0.1,85,100);break;
    case 'cctv_gateway': v.camerasOnline=Math.max(0,ri(-1,1)+v.camerasOnline);v.storageUsed=Math.min(100,v.storageUsed+rnd(0,0.1));v.bandwidth=rw(v.bandwidth,5,0,120);if(Math.random()<0.3)v.motionEvents+=ri(0,5);break;
    case 'fleet_gateway': v.vehiclesConnected=Math.max(0,ri(-3,3)+v.vehiclesConnected);v.avgSpeed=rw(v.avgSpeed,5,0,100);v.activeTrips=Math.max(0,ri(-2,2)+v.activeTrips);if(Math.random()<0.05)v.alertsToday+=1;break;
    case 'smart_home': v.devicesConnected=Math.max(0,ri(-2,2)+v.devicesConnected);v.temp=rw(v.temp,0.3,18,35);v.humidity=rw(v.humidity,1,30,75);v.energyUsage+=rnd(0,0.05);break;
    case 'fire_alarm_gateway': v.batteryBackup=rw(v.batteryBackup,0.1,70,100);if(Math.random()<0.01&&v.activeAlarms===0)v.activeAlarms=1;else if(v.activeAlarms>0&&Math.random()<0.3)v.activeAlarms=0;v.status=v.activeAlarms>0?'Alarm':'Normal';break;
    case 'smoke_detector': v.smokeLevel=rw(v.smokeLevel,3,0,60);v.temp=rw(v.temp,0.3,15,65);v.battery=Math.max(0,v.battery-rnd(0,0.03));v.status=v.smokeLevel>40?'Smoke Detected':'Clear';break;
    case 'irrigation_controller': if(d.power==='on'){v.flowRate=rw(v.flowRate,5,0,150);v.waterUsedToday+=v.flowRate/60;}else{v.flowRate=0;}v.soilMoisture=rw(v.soilMoisture,1,0,100);break;
    case 'machine_monitor_unit': v.avgVibration=rw(v.avgVibration,0.3,0,12);v.avgHealth=rw(v.avgHealth,0.5,0,100);if(Math.random()<0.02)v.faultsToday+=1;break;
    case 'water_flow_meter': if(d.power==='on'){v.flowRate=rw(v.flowRate,10,0,400);v.totalVolume+=v.flowRate/60;v.pressure=rw(v.pressure,0.2,0,8);}else{v.flowRate=0;}v.temp=rw(v.temp,0.2,10,40);break;
    case 'generator_monitor': if(d.power==='on'){v.load=rw(v.load,3,0,100);v.voltage=rw(v.voltage,2,370,450);v.runHours+=1/60;v.fuelLevel=Math.max(0,v.fuelLevel-rnd(0,0.03));v.temp=rw(v.temp,1,30,120);v.status='Running';}else{v.status='Standby';v.load=0;}break;
    default:break;
  }
  const t=TYPES[d.type];const pv=v[t.primary];
  const nh=typeof pv==='number'?[...d.history.slice(1),pv]:d.history;
  return{...d,values:v,history:nh};
}

// ═══════════════════════════════════════════════════════════════════
//  4. HELPERS
// ═══════════════════════════════════════════════════════════════════
const fmt=(v,dec=1)=>typeof v==='number'?v.toFixed(dec):(v||'—');
const fmtPrim=d=>{const t=TYPES[d.type];const v=d.values[t.primary];return typeof v==='number'?`${fmt(v,1)} ${t.unit}`:v||'—';};
const hasAlert=d=>{const t=TYPES[d.type];if(d.status!=='online')return false;const v=d.values[t.primary];if(typeof v!=='number')return false;if(t.alertHigh!=null&&v>t.alertHigh)return true;if(t.alertLow!=null&&v<t.alertLow)return true;return false;};
const nowStr=()=>new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

function genINO(d){
  const t=TYPES[d.type];
  return `// KGP Innovation — Auto-generated firmware sketch
// Device: ${d.name}
// Type: ${t.label}
// Connectivity: ${d.conn}
// Generated: ${new Date().toLocaleString()}

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* SSID       = "YOUR_WIFI_SSID";
const char* WIFI_PASS  = "YOUR_WIFI_PASSWORD";
const char* MQTT_HOST  = "YOUR_AWS_IOT_ENDPOINT";
const int   MQTT_PORT  = 8883;
const char* MQTT_TOPIC = "devices/${d.id}/telemetry";
const char* THING_NAME = "${d.id}";

WiFiClientSecure net;
PubSubClient client(net);

void connectWiFi(){
  WiFi.begin(SSID, WIFI_PASS);
  while(WiFi.status()!=WL_CONNECTED){ delay(500); Serial.print("."); }
  Serial.println("\\nWi-Fi connected: " + WiFi.localIP().toString());
}

void connectMQTT(){
  client.setServer(MQTT_HOST, MQTT_PORT);
  while(!client.connected()){
    if(client.connect(THING_NAME)){ Serial.println("MQTT connected"); }
    else { delay(1000); }
  }
}

void readSensors(JsonDocument& doc){
  // TODO: Replace with real sensor reads
  doc["device_id"] = THING_NAME;
  doc["device_type"] = "${d.type}";
  doc["timestamp"] = millis();
${Object.keys(d.values).slice(0,5).map(k=>`  doc["${k}"] = analogRead(A${Math.floor(Math.random()*4)}) / 4095.0 * 100; // TODO: calibrate`).join('\n')}
}

void setup(){
  Serial.begin(115200);
  connectWiFi();
  connectMQTT();
}

void loop(){
  if(!client.connected()) connectMQTT();
  client.loop();

  StaticJsonDocument<512> doc;
  readSensors(doc);
  String payload;
  serializeJson(doc, payload);
  client.publish(MQTT_TOPIC, payload.c_str());

  delay(60000); // Publish every 60 seconds
}
`;
}

// ═══════════════════════════════════════════════════════════════════
//  5. DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════
const C={blue:'#4F6EF7',blueDark:'#3B54D6',blueLight:'#EEF1FE',ink:'#111827',soft:'#4B5563',faint:'#9CA3AF',bg:'#F5F6FA',card:'#fff',line:'#E7E9F0',green:'#0FA968',greenBg:'#E7F8F0',red:'#E4483C',redBg:'#FDECEB',amber:'#DB8B12',amberBg:'#FDF3E0',teal:'#0891B2',tealBg:'#E4F6FA',purple:'#7C5CE0',purpleBg:'#F1ECFC'};
const pill=(type)=>{const m={online:{bg:C.greenBg,c:C.green},offline:{bg:C.redBg,c:C.red},on:{bg:C.blueLight,c:C.blueDark},off:{bg:'#F1F2F6',c:C.faint},warn:{bg:C.amberBg,c:C.amber},alert:{bg:C.redBg,c:C.red},conn:{bg:C.tealBg,c:C.teal},aws:{bg:'#FFF1E4',c:'#C47300'},admin:{bg:C.purpleBg,c:C.purple}};const s=m[type]||m.off;return{background:s.bg,color:s.c,fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,whiteSpace:'nowrap',display:'inline-block'};};
const btnStyle=(v='primary')=>{const m={primary:{bg:C.blue,c:'#fff',border:'none'},ghost:{bg:C.bg,c:C.ink,border:'none'},outline:{bg:'#fff',c:C.ink,border:`1px solid ${C.line}`},danger:{bg:C.redBg,c:C.red,border:'none'}};const s=m[v]||m.primary;return{background:s.bg,color:s.c,border:s.border,borderRadius:9,padding:'8px 14px',fontWeight:700,fontSize:13,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit'};};
const cardStyle={background:'#fff',borderRadius:14,padding:18,boxShadow:'0 1px 2px rgba(17,24,39,.04),0 4px 14px rgba(17,24,39,.05)'};

// ═══════════════════════════════════════════════════════════════════
//  6. SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const Pill=({type,children})=><span style={pill(type)}>{children}</span>;

const Btn=({v='primary',onClick,disabled,children,style={}})=>(
  <button style={{...btnStyle(v),...style,opacity:disabled?.5:1,cursor:disabled?'not-allowed':'pointer'}} onClick={disabled?undefined:onClick} disabled={disabled}>{children}</button>
);

function Toast({toasts}){
  return(
    <div style={{position:'fixed',top:18,right:18,zIndex:300,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:'#fff',borderLeft:`4px solid ${t.err?C.red:C.green}`,boxShadow:'0 2px 12px rgba(0,0,0,.12)',borderRadius:9,padding:'11px 16px',fontSize:13,minWidth:240,animation:'slidein .2s'}}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function Modal({show,onClose,title,children,wide=false}){
  if(!show)return null;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(17,24,39,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:'#fff',borderRadius:16,padding:24,width:'100%',maxWidth:wide?640:440,boxShadow:'0 20px 60px rgba(0,0,0,.25)',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0,fontSize:17}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:C.faint}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({label,hint,children}){
  return(
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:6,color:C.soft}}>{label}</label>
      {children}
      {hint&&<div style={{fontSize:11,color:C.faint,marginTop:4}}>{hint}</div>}
    </div>
  );
}

const inp={width:'100%',padding:'9px 12px',borderRadius:9,border:`1px solid ${C.line}`,fontSize:13,fontFamily:'inherit',boxSizing:'border-box'};

// ═══════════════════════════════════════════════════════════════════
//  7. DEVICE CARD (memoized)
// ═══════════════════════════════════════════════════════════════════
const DeviceCard=memo(({d,onView,onRename})=>{
  const t=TYPES[d.type];const pv=d.values[t.primary];const alert=hasAlert(d);
  return(
    <div onClick={()=>onView(d.id)} style={{background:'#fff',borderRadius:14,padding:16,boxShadow:'0 1px 2px rgba(17,24,39,.04),0 4px 14px rgba(17,24,39,.05)',cursor:'pointer',border:`1px solid transparent`,transition:'border .15s',position:'relative'}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
      onMouseLeave={e=>e.currentTarget.style.borderColor='transparent'}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
        <div style={{display:'flex',gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{t.icon}</div>
          <div>
            <div style={{fontWeight:800,fontSize:12.5,lineHeight:1.3,color:C.ink}}>{d.name}</div>
            <div style={{fontSize:11,color:C.faint,marginTop:2}}>{d.location} · <span style={{color:t.color,fontWeight:700}}>{t.label}</span></div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
          <Pill type={d.status}>{d.status==='online'?'Online':'Offline'}</Pill>
          <Pill type="conn">{d.conn}</Pill>
        </div>
      </div>
      <div style={{textAlign:'center',margin:'12px 0 8px'}}>
        <b style={{fontSize:24,color:t.color}}>{typeof pv==='number'?fmt(pv,1):pv||'—'}</b>
        <span style={{display:'block',fontSize:10,color:C.faint,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',marginTop:2}}>{t.unit||t.label}</span>
      </div>
      <div style={{textAlign:'center',marginBottom:6}}>
        {alert?<Pill type="alert">⚠ Needs attention</Pill>:<Pill type={d.power==='on'?'on':'off'}>{d.power==='on'?'ACTIVE':'INACTIVE'}</Pill>}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
        <button onClick={e=>{e.stopPropagation();onRename(d);}} style={{background:'none',border:'none',fontSize:11,color:C.blue,cursor:'pointer',fontWeight:700,padding:0}}>✏ Rename</button>
        <span style={{fontSize:11,color:C.faint}}>{d.vendor}</span>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
//  8. OVERVIEW VIEW
// ═══════════════════════════════════════════════════════════════════
function OverviewView({devices,onView,onRename,typeFilter,setTypeFilter}){
  const [search,setSearch]=useState('');
  const [statusF,setStatusF]=useState('');
  const [connF,setConnF]=useState('');
  const [locF,setLocF]=useState('');
  const [alertF,setAlertF]=useState('');
  const [page,setPage]=useState(1);
  const PER=30;

  const locs=useMemo(()=>[...new Set(devices.map(d=>d.location))].sort(),[devices]);
  const typeCounts=useMemo(()=>{const c={};devices.forEach(d=>c[d.type]=(c[d.type]||0)+1);return c;},[devices]);

  const filtered=useMemo(()=>devices.filter(d=>{
    if(typeFilter&&d.type!==typeFilter)return false;
    if(statusF&&d.status!==statusF)return false;
    if(connF&&d.conn!==connF)return false;
    if(locF&&d.location!==locF)return false;
    if(alertF&&!hasAlert(d))return false;
    if(search&&!d.name.toLowerCase().includes(search.toLowerCase())&&!d.location.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  }),[devices,typeFilter,statusF,connF,locF,alertF,search]);

  const totalPages=Math.ceil(filtered.length/PER);
  const visible=filtered.slice((page-1)*PER,page*PER);

  const online=devices.filter(d=>d.status==='online').length;
  const offline=devices.length-online;
  const alerts=devices.filter(hasAlert).length;
  const active=devices.filter(d=>d.power==='on').length;

  useEffect(()=>setPage(1),[typeFilter,statusF,connF,locF,alertF,search]);

  return(
    <div>
      {/* STAT CARDS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:20}}>
        {[
          {lbl:'Total Devices',val:devices.length,delta:'All Types',color:C.blue},
          {lbl:'Online',val:online,delta:`${((online/devices.length)*100).toFixed(1)}% uptime`,color:C.green},
          {lbl:'Offline',val:offline,delta:'Need attention',color:C.red},
          {lbl:'Active',val:active,delta:'Currently powered on',color:C.teal},
          {lbl:'Alerts',val:alerts,delta:'Threshold breaches',color:C.amber},
          {lbl:'Device Types',val:Object.keys(typeCounts).length,delta:'Across fleet',color:C.purple},
        ].map(s=>(
          <div key={s.lbl} style={{...cardStyle,padding:'16px 18px'}}>
            <div style={{fontSize:12,color:C.faint,fontWeight:600}}>{s.lbl}</div>
            <div style={{fontSize:26,fontWeight:800,marginTop:6,color:s.color}}>{s.val.toLocaleString()}</div>
            <div style={{fontSize:11.5,marginTop:4,color:C.soft}}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* TYPE STRIP */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        <div onClick={()=>setTypeFilter('')} style={{padding:'7px 12px',borderRadius:20,border:`1px solid ${typeFilter===''?C.blue:C.line}`,background:typeFilter===''?C.blue:'#fff',color:typeFilter===''?'#fff':C.soft,fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
          All <span style={{opacity:.7}}>{devices.length}</span>
        </div>
        {Object.keys(typeCounts).map(tk=>{const t=TYPES[tk];const active=typeFilter===tk;return(
          <div key={tk} onClick={()=>setTypeFilter(active?'':tk)} style={{padding:'7px 12px',borderRadius:20,border:`1px solid ${active?t.color:C.line}`,background:active?t.color:'#fff',color:active?'#fff':C.soft,fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:active?'#fff':t.color,display:'inline-block'}}></span>
            {t.icon} {t.label} <span style={{opacity:.7}}>{typeCounts[tk]}</span>
          </div>
        );})}
      </div>

      {/* FILTERS */}
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search devices or locations…" style={{...inp,width:220}}/>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Status</option><option value="online">Online</option><option value="offline">Offline</option>
        </select>
        <select value={connF} onChange={e=>setConnF(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Connectivity</option>{CONNS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={locF} onChange={e=>setLocF(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Locations</option>{locs.map(l=><option key={l} value={l}>{l}</option>)}
        </select>
        <select value={alertF} onChange={e=>setAlertF(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Devices</option><option value="1">Needs Attention</option>
        </select>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <span style={{fontSize:12,color:C.faint}}>{filtered.length} devices found</span>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {totalPages>1&&(<>
            <Btn v="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</Btn>
            <span style={{fontSize:13,color:C.soft}}>Page {page} / {totalPages}</span>
            <Btn v="ghost" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</Btn>
          </>)}
        </div>
      </div>

      {/* DEVICE GRID */}
      {visible.length===0
        ?<div style={{textAlign:'center',padding:'40px 20px',color:C.faint}}>No devices match your filters.</div>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {visible.map(d=><DeviceCard key={d.id} d={d} onView={onView} onRename={onRename}/>)}
        </div>
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  9. DEVICES TABLE VIEW
// ═══════════════════════════════════════════════════════════════════
function DevicesView({devices,onView,onRename,onAdd,addLog}){
  const [page,setPage]=useState(1);
  const [search,setSearch]=useState('');
  const PER=25;
  const filtered=useMemo(()=>devices.filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase())||d.location.toLowerCase().includes(search.toLowerCase())),[devices,search]);
  const totalPages=Math.ceil(filtered.length/PER);
  const visible=filtered.slice((page-1)*PER,page*PER);

  const exportDevs=()=>{
    const data=JSON.stringify(devices.map(({id,type,name,location,vendor,conn,status,fw})=>({id,type,name,location,vendor,conn,status,fw})),null,2);
    const a=document.createElement('a');a.href='data:application/json,'+encodeURIComponent(data);a.download='devices-export.json';a.click();
  };

  const thStyle={textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:'.04em',color:C.faint,padding:'8px 10px',borderBottom:`1px solid ${C.line}`};
  const tdStyle={padding:'11px 10px',borderBottom:`1px solid ${C.line}`,verticalAlign:'middle',fontSize:13};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div><h2 style={{margin:0,fontSize:16}}>Device Registry</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Full inventory across all types</p></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search…" style={{...inp,width:180}}/>
          <Btn v="ghost" onClick={exportDevs}>⬇ Export JSON</Btn>
          <Btn v="primary" onClick={onAdd}>+ Add Device</Btn>
        </div>
      </div>

      <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr>
            {['Device','Type','Location','Connectivity','Status','Key Reading','Firmware','Actions'].map(h=><th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {visible.map(d=>{
              const t=TYPES[d.type];const pv=d.values[t.primary];
              return(<tr key={d.id}>
                <td style={tdStyle}><b style={{fontSize:12}}>{d.name}</b><div style={{fontSize:11,color:C.faint}}>{d.vendor}</div></td>
                <td style={tdStyle}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 9px',borderRadius:20,fontSize:11.5,whiteSpace:'nowrap'}}>{t.icon} {t.label}</span></td>
                <td style={tdStyle}>{d.location}</td>
                <td style={tdStyle}><Pill type="conn">{d.conn}</Pill></td>
                <td style={tdStyle}><Pill type={d.status}>{d.status}</Pill></td>
                <td style={tdStyle}><b>{typeof pv==='number'?fmt(pv,1):pv||'—'}</b> {typeof pv==='number'?t.unit:''}</td>
                <td style={tdStyle}>{d.fw||'—'}{d.fw&&d.latestFw&&d.fw!==d.latestFw&&<span style={{fontSize:10,background:C.amberBg,color:C.amber,padding:'2px 6px',borderRadius:6,marginLeft:6}}>update</span>}</td>
                <td style={tdStyle}>
                  <div style={{display:'flex',gap:6'}}>
                    <Btn v="ghost" style={{padding:'5px 10px',fontSize:11}} onClick={()=>onView(d.id)}>View →</Btn>
                    <Btn v="ghost" style={{padding:'5px 10px',fontSize:11}} onClick={()=>onRename(d)}>✏ Rename</Btn>
                  </div>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>

      <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16,alignItems:'center'}}>
        <Btn v="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹ Prev</Btn>
        <span style={{fontSize:13,color:C.soft}}>Page {page} of {totalPages} · {filtered.length} devices</span>
        <Btn v="ghost" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next ›</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 10. DEVICE DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════
function DetailView({d,onBack,onRename,onControl,addLog}){
  if(!d)return<div style={{padding:40,color:C.faint,textAlign:'center'}}>Device not found.</div>;
  const t=TYPES[d.type];
  const pv=d.values[t.primary];
  const alert=hasAlert(d);

  const chartData=d.history.map((v,i)=>({i,v:parseFloat(v.toFixed(2))}));

  const metricKeys=Object.keys(d.values).slice(0,8);

  return(
    <div>
      <div style={{marginBottom:14}}>
        <span style={{color:C.blue,cursor:'pointer',fontWeight:700,fontSize:13}} onClick={onBack}>← Back to Fleet Overview</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:16}}>
        <div>
          {/* IDENTITY CARD */}
          <div style={{...cardStyle}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
              <div style={{display:'flex',gap:12}}>
                <div style={{width:48,height:48,borderRadius:12,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{t.icon}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:16,color:C.ink}}>{d.name}</div>
                  <div style={{fontSize:12,color:C.faint,marginTop:2}}>{d.location} · {d.vendor} · <span style={{color:t.color,fontWeight:700}}>{t.label}</span></div>
                </div>
              </div>
              <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:6}}>
                <Pill type={d.status}>{d.status==='online'?'● Connected':'● Offline'}</Pill>
                <Pill type="conn">{d.conn}</Pill>
              </div>
            </div>

            <div style={{textAlign:'center',margin:'18px 0 10px'}}>
              <b style={{fontSize:32,color:t.color}}>{typeof pv==='number'?fmt(pv,1):pv||'—'} {typeof pv==='number'?t.unit:''}</b>
              <span style={{display:'block',fontSize:11,color:C.faint,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',marginTop:4}}>{t.primary}</span>
              {alert&&<Pill type="alert" style={{marginTop:8}}>⚠ Alert — threshold exceeded</Pill>}
            </div>
            <div style={{textAlign:'center',color:C.faint,fontSize:12}}>Firmware {d.fw||'—'}{d.fw&&d.latestFw&&d.fw!==d.latestFw&&<span style={{color:C.amber,fontWeight:700}}> · update available → {d.latestFw}</span>}</div>
            <div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap'}}>
              <Btn v="ghost" onClick={()=>onRename(d)}>✏ Rename Device</Btn>
              {t.controllable&&<Btn v="primary" onClick={()=>onControl(d)}>⚙ Control</Btn>}
            </div>
          </div>

          {/* CONTROL */}
          {t.controllable&&(
            <div style={{...cardStyle}}>
              <b style={{fontSize:13}}>Device Control</b>
              <p style={{margin:'4px 0 12px',fontSize:12,color:C.faint}}>Power mode for this device</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[{m:'auto',lbl:'Auto',ic:'🔄'},{m:'on',lbl:'Force ON',ic:'▶️'},{m:'off',lbl:'Force OFF',ic:'⏸️'}].map(o=>(
                  <div key={o.m} onClick={()=>onControl(d,o.m)} style={{border:`2px solid ${d.mode===o.m?t.color:C.line}`,borderRadius:11,padding:'14px 8px',textAlign:'center',cursor:'pointer',background:d.mode===o.m?t.bg:'#fff'}}>
                    <div style={{fontSize:20}}>{o.ic}</div>
                    <b style={{display:'block',fontSize:12,marginTop:6,color:d.mode===o.m?t.color:C.ink}}>{o.lbl}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIRMWARE CODE */}
          <div style={{...cardStyle}}>
            <b style={{fontSize:13}}>Firmware</b>
            <p style={{margin:'4px 0 12px',fontSize:12,color:C.faint}}>Auto-generated Arduino sketch for this device</p>
            <Btn v="outline" onClick={()=>{const code=genINO(d);navigator.clipboard?.writeText(code);const a=document.createElement('a');a.href='data:text/plain,'+encodeURIComponent(code);a.download=d.name.toLowerCase()+'.ino';a.click();}}>📄 Download .ino Sketch</Btn>
          </div>
        </div>

        <div>
          {/* LIVE TELEMETRY */}
          <div style={{...cardStyle}}>
            <b style={{fontSize:13}}>Live Telemetry</b>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginTop:10}}>
              {metricKeys.map(k=>{const v=d.values[k];return(
                <div key={k} style={{background:C.bg,borderRadius:10,padding:12}}>
                  <div style={{fontSize:15,fontWeight:800,color:t.color}}>{typeof v==='number'?fmt(v,1):v||'—'}</div>
                  <div style={{fontSize:10.5,color:C.faint,marginTop:2}}>{k}</div>
                </div>
              );})}
            </div>
          </div>

          {/* HISTORY CHART */}
          <div style={{...cardStyle}}>
            <b style={{fontSize:13}}>{t.label} — Last 24 Readings</b>
            <div style={{height:200,marginTop:12}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="i" hide/>
                  <YAxis hide/>
                  <Tooltip formatter={v=>[fmt(v,2),t.primary]}/>
                  <Area type="monotone" dataKey="v" stroke={t.color} fill={t.bg} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DEVICE INFO */}
          <div style={{...cardStyle}}>
            <b style={{fontSize:13}}>Device Info</b>
            <table style={{width:'100%',fontSize:12,marginTop:10,borderCollapse:'collapse'}}>
              <tbody>
                {[['ID',d.id],['Type',t.label],['Location',d.location],['Vendor',d.vendor],['Connectivity',d.conn],['Firmware',d.fw],['Latest Available',d.latestFw],['Status',d.status],['Power',d.power],['Uptime',`${fmt(d.uptime,1)}%`]].map(([k,v])=>(
                  <tr key={k}><td style={{padding:'6px 0',color:C.faint,width:'45%'}}>{k}</td><td style={{padding:'6px 0',fontWeight:600}}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 11. ANALYTICS VIEW
// ═══════════════════════════════════════════════════════════════════
function AnalyticsView({devices}){
  const [selId,setSelId]=useState('');
  const selDev=useMemo(()=>selId?devices.find(d=>d.id===selId):devices[0],[selId,devices]);

  const typeData=useMemo(()=>{const c={};devices.forEach(d=>c[d.type]=(c[d.type]||0)+1);return Object.entries(c).map(([k,v])=>({name:TYPES[k].label,value:v,color:TYPES[k].color}));},[devices]);
  const connData=useMemo(()=>{const c={};devices.forEach(d=>c[d.conn]=(c[d.conn]||0)+1);return Object.entries(c).map(([k,v])=>({name:k,value:v}));},[devices]);
  const statusByLoc=useMemo(()=>{const c={};devices.forEach(d=>{if(!c[d.location])c[d.location]={loc:d.location,online:0,offline:0};c[d.location][d.status]++;});return Object.values(c).slice(0,10);},[devices]);
  const alertsByType=useMemo(()=>Object.keys(TYPES).map(tk=>({name:TYPES[tk].label.substring(0,12),alerts:devices.filter(d=>d.type===tk&&hasAlert(d)).length,total:devices.filter(d=>d.type===tk).length})).filter(x=>x.alerts>0),[devices]);

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div><h2 style={{margin:0,fontSize:16}}>Analytics</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Trends and fleet composition</p></div>
        <select value={selId} onChange={e=>setSelId(e.target.value)} style={{...inp,width:240}}>
          {devices.slice(0,100).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {selDev&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
          <div style={{...cardStyle}}>
            <b style={{fontSize:13}}>{selDev.name} — Primary Metric Trend</b>
            <div style={{height:200,marginTop:10}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selDev.history.map((v,i)=>({i,v:parseFloat(v.toFixed(2))}))}>
                  <XAxis dataKey="i" hide/><YAxis hide/>
                  <Tooltip formatter={v=>[fmt(v,2),TYPES[selDev.type].primary]}/>
                  <Area type="monotone" dataKey="v" stroke={TYPES[selDev.type].color} fill={TYPES[selDev.type].bg} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{...cardStyle}}>
            <b style={{fontSize:13}}>Fleet by Device Type</b>
            <div style={{height:200,marginTop:10}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={false}>
                    {typeData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n,p)=>[v,p.payload.name]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{...cardStyle}}>
          <b style={{fontSize:13}}>Connectivity Mix</b>
          <div style={{height:200,marginTop:10}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={connData}><XAxis dataKey="name" tick={{fontSize:12}}/><YAxis hide/><Tooltip/><Bar dataKey="value" fill={C.blue} radius={[4,4,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{...cardStyle}}>
          <b style={{fontSize:13}}>Online vs Offline by Location</b>
          <div style={{height:200,marginTop:10}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusByLoc}><XAxis dataKey="loc" tick={{fontSize:10}}/><YAxis hide/><Tooltip/><Legend/><Bar dataKey="online" fill={C.green} stackId="a" radius={[4,4,0,0]}/><Bar dataKey="offline" fill={C.red} stackId="a" radius={[0,0,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {alertsByType.length>0&&(
        <div style={{...cardStyle}}>
          <b style={{fontSize:13}}>Alert Distribution by Device Type</b>
          <div style={{height:180,marginTop:10}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertsByType}><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis hide/><Tooltip/><Bar dataKey="alerts" fill={C.amber} radius={[4,4,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 12. OTA VIEW
// ═══════════════════════════════════════════════════════════════════
function OtaView({devices,addLog,addToast}){
  const [pushed,setPushed]=useState(new Set());
  const eligible=useMemo(()=>devices.filter(d=>d.fw&&d.latestFw&&d.fw!==d.latestFw),[devices]);

  const push=id=>{setPushed(s=>new Set([...s,id]));addToast('OTA pushed to device');addLog('OTA Firmware Update','Admin',`Pushed to ${devices.find(d=>d.id===id)?.name}`,'Routine update');};

  const thStyle={textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:'.04em',color:C.faint,padding:'8px 10px',borderBottom:`1px solid ${C.line}`};
  const tdStyle={padding:'11px 10px',borderBottom:`1px solid ${C.line}`,verticalAlign:'middle',fontSize:13};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div><h2 style={{margin:0,fontSize:16}}>OTA Firmware Updates</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>{eligible.length} devices eligible for update</p></div>
        <Btn v="primary" onClick={()=>eligible.forEach(d=>push(d.id))}>⬆ Push All Updates</Btn>
      </div>
      <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Device','Type','Current','Latest','Status','Action'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {eligible.length===0?<tr><td colSpan={6} style={{...tdStyle,textAlign:'center',color:C.faint}}>All devices are up to date ✅</td></tr>:eligible.map(d=>{
              const t=TYPES[d.type];const done=pushed.has(d.id);
              return(<tr key={d.id}>
                <td style={tdStyle}><b style={{fontSize:12}}>{d.name}</b></td>
                <td style={tdStyle}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 8px',borderRadius:20,fontSize:11}}>{t.icon} {t.label}</span></td>
                <td style={tdStyle}><code style={{fontSize:12}}>{d.fw}</code></td>
                <td style={tdStyle}><code style={{fontSize:12,color:C.green}}>{d.latestFw}</code></td>
                <td style={tdStyle}>{done?<Pill type="on">✓ Pushed</Pill>:<Pill type="warn">Pending</Pill>}</td>
                <td style={tdStyle}><Btn v={done?'ghost':'primary'} style={{fontSize:11,padding:'5px 10px'}} onClick={()=>push(d.id)} disabled={done}>{done?'Done':'⬆ Push'}</Btn></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 13. LOGS VIEW
// ═══════════════════════════════════════════════════════════════════
function LogsView({logs}){
  const thStyle={textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:'.04em',color:C.faint,padding:'8px 10px',borderBottom:`1px solid ${C.line}`};
  const tdStyle={padding:'11px 10px',borderBottom:`1px solid ${C.line}`,verticalAlign:'middle',fontSize:13};
  return(
    <div>
      <div style={{marginBottom:16}}><h2 style={{margin:0,fontSize:16}}>Audit Logs</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Every action logged with operator and reason</p></div>
      <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Time','Device','User','Action','Reason'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {logs.length===0?<tr><td colSpan={5} style={{...tdStyle,textAlign:'center',color:C.faint}}>No audit log entries yet.</td></tr>:logs.map((l,i)=>(
              <tr key={i}><td style={{...tdStyle,color:C.faint,fontSize:11,whiteSpace:'nowrap'}}>{l.time}</td><td style={tdStyle}><b style={{fontSize:12}}>{l.device}</b></td><td style={tdStyle}>{l.user}</td><td style={tdStyle}>{l.action}</td><td style={{...tdStyle,color:C.soft}}>{l.reason}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 14. USERS VIEW
// ═══════════════════════════════════════════════════════════════════
function UsersView({users,setUsers,addToast}){
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',email:'',role:'Operator',password:''});

  const addUser=()=>{
    if(!form.name||!form.email){addToast('Name and email required',true);return;}
    setUsers(u=>[...u,{id:'u'+Date.now(),...form}]);setShowAdd(false);setForm({name:'',email:'',role:'Operator',password:''});addToast('User created');
  };

  const roleColor={Admin:{bg:C.purpleBg,c:C.purple},Operator:{bg:C.blueLight,c:C.blueDark},Viewer:{bg:'#F1F2F6',c:C.soft}};
  const thStyle={textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:'.04em',color:C.faint,padding:'8px 10px',borderBottom:`1px solid ${C.line}`};
  const tdStyle={padding:'11px 10px',borderBottom:`1px solid ${C.line}`,verticalAlign:'middle',fontSize:13};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h2 style={{margin:0,fontSize:16}}>Users & Roles</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Role-based access control</p></div>
        <Btn v="primary" onClick={()=>setShowAdd(true)}>+ Add User</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{...cardStyle}}>
          <b>Role Permissions</b>
          <table style={{width:'100%',fontSize:12,marginTop:12,borderCollapse:'collapse'}}>
            <thead><tr>{['Capability','Admin','Operator','Viewer'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 8px',color:C.faint,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>
              {[['View devices & telemetry','✅','✅','✅'],['Control devices','✅','✅','—'],['Push OTA updates','✅','—','—'],['Generate reports','✅','✅','—'],['Manage users','✅','—','—']].map(row=>(
                <tr key={row[0]}><td style={{padding:'7px 8px',borderTop:`1px solid ${C.line}`}}>{row[0]}</td>{row.slice(1).map((v,i)=><td key={i} style={{padding:'7px 8px',borderTop:`1px solid ${C.line}`,textAlign:'center'}}>{v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{...cardStyle}}>
          <b>Summary</b>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:12}}>
            {['Admin','Operator','Viewer'].map(r=>{const rc=roleColor[r];const cnt=users.filter(u=>u.role===r).length;return(
              <div key={r} style={{background:rc.bg,borderRadius:10,padding:12,textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:rc.c}}>{cnt}</div>
                <div style={{fontSize:11,color:rc.c,fontWeight:700,marginTop:4}}>{r}s</div>
              </div>
            );})}
          </div>
        </div>
      </div>

      <div style={{...cardStyle,padding:0}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['User','Email','Role','Password'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u=>{const rc=roleColor[u.role]||roleColor.Viewer;return(
              <tr key={u.id}><td style={tdStyle}><b>{u.name}</b></td><td style={{...tdStyle,color:C.faint}}>{u.email}</td><td style={tdStyle}><span style={{...pill('conn'),background:rc.bg,color:rc.c}}>{u.role}</span></td><td style={{...tdStyle,color:C.faint,fontFamily:'monospace',letterSpacing:2}}>{'●'.repeat(u.password?.length||6)}</td></tr>
            );})}
          </tbody>
        </table>
      </div>

      <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="+ Add User">
        <Field label="Full Name *"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Priya Sharma" style={inp}/></Field>
        <Field label="Email *"><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="name@company.com" style={inp}/></Field>
        <Field label="Role">
          <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={inp}>
            <option>Admin</option><option>Operator</option><option>Viewer</option>
          </select>
        </Field>
        <Field label="Password *"><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Temporary password" style={inp}/></Field>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
          <Btn v="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
          <Btn v="primary" onClick={addUser}>Create User</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 15. SETTINGS VIEW
// ═══════════════════════════════════════════════════════════════════
function SettingsView({awsCfg,setAwsCfg,addToast}){
  const [form,setForm]=useState(awsCfg);
  const save=()=>{setAwsCfg(form);addToast('Settings saved');};
  return(
    <div>
      <div style={{marginBottom:16}}><h2 style={{margin:0,fontSize:16}}>Settings</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>AWS IoT Core & connectivity configuration</p></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{...cardStyle}}>
          <b>☁ AWS IoT Core Connection</b>
          <p style={{margin:'6px 0 14px',fontSize:12,color:C.faint}}>Connect to your AWS IoT Core endpoint. Devices publish telemetry via MQTT over TLS to your endpoint. Until connected, the dashboard runs simulated live data.</p>
          <Field label="IoT Endpoint"><input value={form.endpoint} onChange={e=>setForm(f=>({...f,endpoint:e.target.value}))} placeholder="xxxxxxx.iot.ap-south-1.amazonaws.com" style={inp}/></Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Field label="Region"><input value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))} placeholder="ap-south-1" style={inp}/></Field>
            <Field label="Port"><input value={form.port} onChange={e=>setForm(f=>({...f,port:e.target.value}))} placeholder="8883" style={inp}/></Field>
          </div>
          <Field label="Base Topic"><input value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} placeholder="devices/+/telemetry" style={inp}/></Field>
          <Field label="Thing Group Prefix"><input value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} placeholder="kgp-fleet" style={inp}/></Field>
          <div style={{display:'flex',gap:8}}>
            <Btn v="primary" onClick={save}>Save & Connect</Btn>
            <Btn v="ghost" onClick={()=>addToast('Running in simulation mode')}>Use Simulation</Btn>
          </div>
        </div>

        <div>
          <div style={{...cardStyle,marginBottom:16}}>
            <b>AWS Architecture</b>
            <div style={{marginTop:14,fontSize:12,color:C.soft,lineHeight:1.8}}>
              <div style={{background:C.bg,borderRadius:10,padding:14}}>
                <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:12}}>
                  {[['🏭 IoT Devices (ESP32/Arduino)','MQTT over TLS →'],['☁ AWS IoT Core','Rules Engine →'],['⚡ AWS Lambda','Process + validate →'],['📦 Amazon DynamoDB','Time-series telemetry →'],['📊 This Dashboard','Real-time visualization']].map(([a,b])=>(
                    <div key={a} style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{background:'#fff',border:`1px solid ${C.line}`,borderRadius:8,padding:'4px 10px',fontWeight:700,fontSize:11,flex:1}}>{a}</span>
                      <span style={{color:C.faint,fontSize:10}}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{...cardStyle}}>
            <b>Billing Config</b>
            <Field label="Tariff Rate (₹/kWh)" hint="Applied to energy meters, street lights, solar"><input value={form.tariff} onChange={e=>setForm(f=>({...f,tariff:e.target.value}))} type="number" step="0.1" style={inp}/></Field>
            <Field label="Fixed Monthly Charge per Device (₹)"><input value={form.fixedCharge} onChange={e=>setForm(f=>({...f,fixedCharge:e.target.value}))} type="number" style={inp}/></Field>
            <Btn v="primary" onClick={save}>Save Config</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 16. REPORTS VIEW
// ═══════════════════════════════════════════════════════════════════
function ReportsView({devices,awsCfg}){
  const [tab,setTab]=useState('energy');
  const energyDevs=useMemo(()=>devices.filter(d=>TYPES[d.type].energy),[devices]);
  const rate=parseFloat(awsCfg.tariff)||7.5;
  const fixed=parseFloat(awsCfg.fixedCharge)||25;

  const totalEnergy=energyDevs.reduce((s,d)=>s+(d.values.energy||d.values.generated||d.values.sessionEnergy||0),0);
  const totalBill=energyDevs.length*fixed+totalEnergy*rate;

  const thStyle={textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:'.04em',color:C.faint,padding:'8px 10px',borderBottom:`1px solid ${C.line}`};
  const tdStyle={padding:'11px 10px',borderBottom:`1px solid ${C.line}`,verticalAlign:'middle',fontSize:13};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div><h2 style={{margin:0,fontSize:16}}>Reports & Billing</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Energy billing for power devices</p></div>
        <div style={{display:'flex',gap:8}}>
          {['energy','monitoring'].map(t=><Btn key={t} v={tab===t?'primary':'ghost'} onClick={()=>setTab(t)}>{t==='energy'?'Energy Billing':'Monitoring Report'}</Btn>)}
        </div>
      </div>

      {tab==='energy'&&(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:20}}>
            {[{l:'Energy Devices',v:energyDevs.length,c:C.blue},{l:'Total Energy (kWh)',v:fmt(totalEnergy,1),c:C.green},{l:'Tariff Rate',v:`₹${rate}/kWh`,c:C.amber},{l:'Total Bill',v:`₹${fmt(totalBill,2)}`,c:C.purple}].map(s=>(
              <div key={s.l} style={{...cardStyle,padding:'16px 18px'}}>
                <div style={{fontSize:12,color:C.faint,fontWeight:600}}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:800,marginTop:6,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Device','Type','Location','Energy (kWh)','Rate','Fixed','Total'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {energyDevs.map(d=>{const t=TYPES[d.type];const e=d.values.energy||d.values.generated||d.values.sessionEnergy||0;const total=e*rate+fixed;return(
                  <tr key={d.id}><td style={tdStyle}><b style={{fontSize:12}}>{d.name}</b></td><td style={tdStyle}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 8px',borderRadius:20,fontSize:11}}>{t.icon} {t.label}</span></td><td style={tdStyle}>{d.location}</td><td style={{...tdStyle,fontWeight:700}}>{fmt(e,2)}</td><td style={tdStyle}>₹{rate}</td><td style={tdStyle}>₹{fixed}</td><td style={{...tdStyle,fontWeight:700,color:C.green}}>₹{fmt(total,2)}</td></tr>
                );})}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==='monitoring'&&(
        <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Device','Type','Primary Metric','Min','Max','Uptime','Alerts'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {devices.slice(0,50).map(d=>{const t=TYPES[d.type];const mn=Math.min(...d.history);const mx=Math.max(...d.history);const alert=hasAlert(d);return(
                <tr key={d.id}><td style={tdStyle}><b style={{fontSize:12}}>{d.name}</b></td><td style={tdStyle}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 8px',borderRadius:20,fontSize:11}}>{t.icon} {t.label}</span></td><td style={tdStyle}>{fmtPrim(d)}</td><td style={tdStyle}>{fmt(mn,1)}</td><td style={tdStyle}>{fmt(mx,1)}</td><td style={tdStyle}>{fmt(d.uptime,1)}%</td><td style={tdStyle}>{alert?<Pill type="alert">⚠ Alert</Pill>:<Pill type="on">OK</Pill>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 17. ADD DEVICE MODAL
// ═══════════════════════════════════════════════════════════════════
function AddDeviceModal({show,onClose,onAdd}){
  const [form,setForm]=useState({type:'street_light',name:'',location:'',vendor:'',conn:'WiFi',bulk:1});
  const [err,setErr]=useState('');

  const submit=()=>{
    if(!form.name.trim()||!form.location.trim()){setErr('Name and Location are required.');return;}
    const count=Math.max(1,Math.min(100,parseInt(form.bulk)||1));
    const devs=Array.from({length:count},(_,i)=>{
      const t=TYPES[form.type];const fw=mkFW(),lfw=Math.random()>0.4?mkFW():fw;const vals=initV(form.type);const pv=vals[t.primary];
      return{id:'dev_'+(_did++),type:form.type,name:count>1?`${form.name}-${String(i+1).padStart(2,'0')}`:form.name,location:form.location,vendor:form.vendor||(VM[form.type]||['Generic'])[0],conn:form.conn,status:'online',power:'on',mode:'auto',fw,latestFw:lfw,values:vals,history:Array.from({length:24},()=>Math.max(0,(typeof pv==='number'?pv:50)*rnd(0.85,1.15))),uptime:rnd(90,100),dailyEnergy:Array.from({length:14},()=>rnd(0,30))};
    });
    onAdd(devs);onClose();setForm({type:'street_light',name:'',location:'',vendor:'',conn:'WiFi',bulk:1});setErr('');
  };

  return(
    <Modal show={show} onClose={onClose} title="+ Add New Device(s)">
      {err&&<div style={{background:C.redBg,color:C.red,borderRadius:9,padding:'10px 13px',fontSize:13,marginBottom:12}}>{err}</div>}
      <Field label="Device Type *">
        <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inp}>
          {TK.map(k=><option key={k} value={k}>{TYPES[k].icon} {TYPES[k].label}</option>)}
        </select>
      </Field>
      <Field label="Device Name *" hint="For bulk add, a suffix -01, -02... will be appended"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. TANUKU-SMART-DUSTBIN" style={inp}/></Field>
      <Field label="Location *"><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Tanuku" style={inp}/></Field>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <Field label="Vendor"><input value={form.vendor} onChange={e=>setForm(f=>({...f,vendor:e.target.value}))} placeholder="Auto-filled" style={inp}/></Field>
        <Field label="Connectivity"><select value={form.conn} onChange={e=>setForm(f=>({...f,conn:e.target.value}))} style={inp}>{CONNS.map(c=><option key={c}>{c}</option>)}</select></Field>
      </div>
      <Field label="Bulk Add (1–100)" hint="Add multiple identical devices at once"><input type="number" min={1} max={100} value={form.bulk} onChange={e=>setForm(f=>({...f,bulk:e.target.value}))} style={inp}/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
        <Btn v="ghost" onClick={onClose}>Cancel</Btn>
        <Btn v="primary" onClick={submit}>Add {Math.max(1,parseInt(form.bulk)||1)} Device{parseInt(form.bulk)>1?'s':''}</Btn>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 18. RENAME MODAL
// ═══════════════════════════════════════════════════════════════════
function RenameModal({device,onClose,onSave}){
  const [name,setName]=useState(device?.name||'');
  useEffect(()=>setName(device?.name||''),[device]);
  return(
    <Modal show={!!device} onClose={onClose} title="✏ Rename Device">
      <Field label="New Device Name">
        <input value={name} onChange={e=>setName(e.target.value)} style={inp} autoFocus onKeyDown={e=>e.key==='Enter'&&onSave(name)}/>
      </Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
        <Btn v="ghost" onClick={onClose}>Cancel</Btn>
        <Btn v="primary" onClick={()=>onSave(name)}>Save Name</Btn>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 19. CONTROL MODAL
// ═══════════════════════════════════════════════════════════════════
function ControlModal({device,initialMode,onClose,onConfirm,users,currentUser}){
  const [mode,setMode]=useState(initialMode||'auto');
  const [reason,setReason]=useState('');
  const [pass,setPass]=useState('');
  const [err,setErr]=useState('');
  useEffect(()=>{setMode(initialMode||'auto');setReason('');setPass('');setErr('');},[device,initialMode]);
  const t=device?TYPES[device.type]:null;
  const confirm=()=>{
    const u=users.find(u=>u.id===currentUser);
    if(!pass||pass!==u?.password){setErr('Invalid password');return;}
    if(!reason.trim()){setErr('Reason is required');return;}
    onConfirm(device.id,mode,reason);onClose();
  };
  return(
    <Modal show={!!device} onClose={onClose} title="⚠ Confirm Control Change">
      {device&&<>
        <div style={{background:C.blueLight,color:C.blueDark,borderRadius:9,padding:'11px 13px',fontSize:13,marginBottom:14}}>Changing <b>{device.name}</b> to <b style={{color:t?.color}}>{mode.toUpperCase()}</b> mode</div>
        {err&&<div style={{background:C.redBg,color:C.red,borderRadius:9,padding:'9px 12px',fontSize:12,marginBottom:12}}>{err}</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {['auto','on','off'].map(m=><div key={m} onClick={()=>setMode(m)} style={{border:`2px solid ${mode===m?(t?.color||C.blue):C.line}`,borderRadius:10,padding:12,textAlign:'center',cursor:'pointer',background:mode===m?(t?.bg||C.blueLight):'#fff'}}><b style={{fontSize:13,color:mode===m?(t?.color||C.blue):C.ink}}>{m.toUpperCase()}</b></div>)}
        </div>
        <Field label="Your Password *"><input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={inp}/></Field>
        <Field label="Reason for Change *" hint="Logged for audit purposes"><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Manual override for maintenance" style={{...inp,minHeight:70,resize:'vertical'}}/></Field>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
          <Btn v="ghost" onClick={onClose}>Cancel</Btn>
          <Btn v="primary" onClick={confirm}>Verify & Confirm</Btn>
        </div>
      </>}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 20. SIDEBAR
// ═══════════════════════════════════════════════════════════════════
const NAV=[
  {id:'overview',ic:'📡',lbl:'Fleet Overview',badge:'Live'},
  {id:'devices',ic:'🧩',lbl:'All Devices'},
  {id:'analytics',ic:'📊',lbl:'Analytics'},
  {id:'reports',ic:'🧾',lbl:'Reports & Billing'},
  {id:'ota',ic:'⬆️',lbl:'OTA Updates'},
  {id:'logs',ic:'🗒️',lbl:'Audit Logs'},
];
const NAV2=[
  {id:'users',ic:'👥',lbl:'Users & Roles'},
  {id:'settings',ic:'⚙️',lbl:'Settings'},
];

function Sidebar({view,setView,currentUser,users}){
  const u=users.find(x=>x.id===currentUser)||users[0];
  const navItem=(item)=>{const active=view===item.id;return(
    <div key={item.id} onClick={()=>setView(item.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:9,color:active?C.blueDark:C.soft,fontWeight:active?700:500,fontSize:13.5,cursor:'pointer',marginBottom:2,background:active?C.blueLight:'transparent'}}>
      <span style={{width:17,textAlign:'center',fontSize:14}}>{item.ic}</span>
      {item.lbl}
      {item.badge&&<span style={{marginLeft:'auto',fontSize:9.5,fontWeight:800,background:C.greenBg,color:C.green,padding:'2px 6px',borderRadius:20}}>{item.badge}</span>}
    </div>
  );};
  return(
    <div style={{width:236,background:'#fff',borderRight:`1px solid ${C.line}`,display:'flex',flexDirection:'column',padding:'20px 14px',flexShrink:0,position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:9,padding:'4px 8px 22px',fontWeight:800,fontSize:17}}>
        <div style={{width:26,height:26,borderRadius:8,background:'linear-gradient(135deg,#4F6EF7,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14}}>⚡</div>
        KGP Innovation
      </div>
      <div style={{fontSize:10.5,fontWeight:700,letterSpacing:'.06em',color:C.faint,textTransform:'uppercase',margin:'16px 10px 6px'}}>Unified IoT Console</div>
      {NAV.map(navItem)}
      <div style={{fontSize:10.5,fontWeight:700,letterSpacing:'.06em',color:C.faint,textTransform:'uppercase',margin:'16px 10px 6px'}}>Administration</div>
      {NAV2.map(navItem)}
      <div style={{marginTop:'auto',display:'flex',alignItems:'center',gap:9,padding:'10px 8px',borderTop:`1px solid ${C.line}`,paddingTop:14}}>
        <div style={{width:32,height:32,borderRadius:'50%',background:C.blue,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{(u?.name||'A')[0].toUpperCase()}</div>
        <div><div style={{fontSize:13,fontWeight:700}}>{u?.name||'admin'}</div><div style={{fontSize:11,color:C.faint}}>{u?.role||'Admin'}</div></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 21. MAIN APP
// ═══════════════════════════════════════════════════════════════════
const INITIAL_USERS=[
  {id:'u1',name:'admin',email:'admin@kgpinovation.com',role:'Admin',password:'admin123'},
  {id:'u2',name:'Ravi Kumar',email:'ravi@kgpinovation.com',role:'Operator',password:'operator123'},
  {id:'u3',name:'Lakshmi N',email:'lakshmi@kgpinovation.com',role:'Viewer',password:'viewer123'},
];

export default function App(){
  const [devices,setDevices]=useState(()=>genDevices(1000));
  const [view,setView]=useState('overview');
  const [selectedId,setSelectedId]=useState(null);
  const [typeFilter,setTypeFilter]=useState('');
  const [renameDevice,setRenameDevice]=useState(null);
  const [controlDevice,setControlDevice]=useState(null);
  const [controlMode,setControlMode]=useState('auto');
  const [showAdd,setShowAdd]=useState(false);
  const [users,setUsers]=useState(INITIAL_USERS);
  const [currentUser,setCurrentUser]=useState('u1');
  const [logs,setLogs]=useState([]);
  const [toasts,setToasts]=useState([]);
  const [countdown,setCountdown]=useState(60);
  const [awsCfg,setAwsCfg]=useState({endpoint:'',region:'ap-south-1',port:'8883',topic:'devices/+/telemetry',group:'kgp-fleet',tariff:'7.5',fixedCharge:'25'});
  const tickRef=useRef(null);
  const cntRef=useRef(null);

  const addToast=useCallback((msg,err=false)=>{const id=Date.now();setToasts(t=>[...t,{id,msg,err}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);},[]);
  const addLog=useCallback((device,user,action,reason='—')=>setLogs(l=>[{time:nowStr(),device,user,action,reason},...l.slice(0,199)]),[]);

  // 60-second real-time tick
  useEffect(()=>{
    tickRef.current=setInterval(()=>{setDevices(prev=>prev.map(tickDev));setCountdown(60);addToast('📡 Fleet data refreshed');},60000);
    cntRef.current=setInterval(()=>setCountdown(c=>Math.max(0,c-1)),1000);
    return()=>{clearInterval(tickRef.current);clearInterval(cntRef.current);};
  },[]);

  const navToDetail=useCallback(id=>{setSelectedId(id);setView('detail');},[]);

  const handleRename=useCallback((newName)=>{
    if(!newName.trim()){addToast('Name cannot be empty',true);return;}
    setDevices(prev=>prev.map(d=>d.id===renameDevice.id?{...d,name:newName.trim()}:d));
    addLog(newName,'Admin','Renamed device',`From: ${renameDevice.name}`);
    addToast(`Renamed to "${newName.trim()}"`);setRenameDevice(null);
  },[renameDevice,addLog,addToast]);

  const handleControl=useCallback((device,mode)=>{
    if(mode){setControlMode(mode);}else{setControlMode(device.mode||'auto');}
    setControlDevice(device);
  },[]);

  const confirmControl=useCallback((deviceId,mode,reason)=>{
    setDevices(prev=>prev.map(d=>d.id===deviceId?{...d,mode,power:mode==='on'?'on':mode==='off'?'off':d.power}:d));
    const d=devices.find(x=>x.id===deviceId);
    const u=users.find(x=>x.id===currentUser);
    addLog(d?.name||deviceId,u?.name||'Admin',`Control → ${mode}`,reason);
    addToast(`Device set to ${mode} mode`);
  },[devices,users,currentUser,addLog,addToast]);

  const handleAddDevices=useCallback(devs=>{
    setDevices(prev=>[...prev,...devs]);
    addToast(`${devs.length} device${devs.length>1?'s':''} added`);
    addLog(devs[0]?.name,'Admin',`Added ${devs.length} device(s)`,'New device provisioning');
  },[addLog,addToast]);

  const selectedDevice=useMemo(()=>devices.find(d=>d.id===selectedId),[devices,selectedId]);

  const viewTitles={overview:'Fleet Overview',devices:'All Devices',detail:'Device Detail',analytics:'Analytics',reports:'Reports & Billing',ota:'OTA Updates',logs:'Audit Logs',users:'Users & Roles',settings:'Settings'};

  return(
    <div style={{display:'flex',minHeight:'100vh',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',background:C.bg,color:C.ink,fontSize:14}}>
      <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-thumb{background:#D6D9E3;border-radius:8px;}@keyframes slidein{from{transform:translateX(20px);opacity:0;}to{transform:translateX(0);opacity:1;}}`}</style>

      <Sidebar view={view} setView={setView} currentUser={currentUser} users={users}/>

      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        {/* TOPBAR */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 26px',background:'#fff',borderBottom:`1px solid ${C.line}`,position:'sticky',top:0,zIndex:20,flexWrap:'wrap',gap:10}}>
          <div>
            <h1 style={{fontSize:18,margin:0,fontWeight:800}}>{viewTitles[view]||view}</h1>
            <div style={{fontSize:12,color:C.faint,marginTop:1}}>
              {view==='overview'?`${devices.length.toLocaleString()} devices · ${devices.filter(d=>d.status==='online').length} online`:'KGP Innovation Unified IoT Console'}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            {/* AWS status */}
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,padding:'6px 11px',borderRadius:20,background:'#FFF1E4',color:'#C47300'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#C47300',display:'inline-block'}}></span>
              AWS: Simulation
            </div>
            {/* Countdown */}
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,padding:'6px 11px',borderRadius:20,background:C.greenBg,color:C.green}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:C.green,display:'inline-block',animation:'blink 1.6s infinite'}}></span>
              <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:.25;}}`}</style>
              Refresh in {countdown}s
            </div>
            <Btn v="ghost" onClick={()=>{setDevices(prev=>prev.map(tickDev));setCountdown(60);addToast('📡 Manually refreshed');}}>↻ Refresh Now</Btn>
            {/* User select */}
            <select value={currentUser} onChange={e=>setCurrentUser(e.target.value)} style={{...inp,width:'auto',padding:'7px 10px',fontSize:12.5,fontWeight:700}}>
              {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <Btn v="primary" onClick={()=>setShowAdd(true)}>+ Add Device</Btn>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{padding:'22px 26px',flex:1,overflowY:'auto'}}>
          {view==='overview'&&<OverviewView devices={devices} onView={navToDetail} onRename={setRenameDevice} typeFilter={typeFilter} setTypeFilter={setTypeFilter}/>}
          {view==='devices'&&<DevicesView devices={devices} onView={navToDetail} onRename={setRenameDevice} onAdd={()=>setShowAdd(true)} addLog={addLog}/>}
          {view==='detail'&&<DetailView d={selectedDevice} onBack={()=>setView('overview')} onRename={setRenameDevice} onControl={handleControl} addLog={addLog}/>}
          {view==='analytics'&&<AnalyticsView devices={devices}/>}
          {view==='reports'&&<ReportsView devices={devices} awsCfg={awsCfg}/>}
          {view==='ota'&&<OtaView devices={devices} addLog={addLog} addToast={addToast}/>}
          {view==='logs'&&<LogsView logs={logs}/>}
          {view==='users'&&<UsersView users={users} setUsers={setUsers} addToast={addToast}/>}
          {view==='settings'&&<SettingsView awsCfg={awsCfg} setAwsCfg={setAwsCfg} addToast={addToast}/>}
        </div>
      </div>

      {/* MODALS */}
      <AddDeviceModal show={showAdd} onClose={()=>setShowAdd(false)} onAdd={handleAddDevices}/>
      <RenameModal device={renameDevice} onClose={()=>setRenameDevice(null)} onSave={handleRename}/>
      <ControlModal device={controlDevice} initialMode={controlMode} onClose={()=>setControlDevice(null)} onConfirm={confirmControl} users={users} currentUser={currentUser}/>
      <Toast toasts={toasts}/>
    </div>
  );
}