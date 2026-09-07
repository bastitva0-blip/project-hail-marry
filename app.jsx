import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ══════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════
const C = {
  blue:'#4F6EF7', blueDark:'#3B54D6', blueLight:'#EEF1FE',
  ink:'#111827', soft:'#4B5563', faint:'#9CA3AF',
  bg:'#F5F6FA', card:'#fff', line:'#E7E9F0',
  green:'#0FA968', greenBg:'#E7F8F0',
  red:'#E4483C', redBg:'#FDECEB',
  amber:'#DB8B12', amberBg:'#FDF3E0',
  teal:'#0891B2', tealBg:'#E4F6FA',
  purple:'#7C5CE0', purpleBg:'#F1ECFC',
};
const SHADOW = '0 1px 2px rgba(17,24,39,.04), 0 4px 14px rgba(17,24,39,.05)';
const cardStyle = { background:'#fff', borderRadius:14, padding:18, boxShadow:SHADOW };
const inpStyle = { width:'100%', padding:'9px 12px', borderRadius:9, border:`1px solid ${C.line}`, fontSize:13, fontFamily:'inherit', color:C.ink, background:'#fff', boxSizing:'border-box', outline:'none' };
const thS = { textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'.04em', color:C.faint, padding:'9px 12px', borderBottom:`1px solid ${C.line}`, fontWeight:700 };
const tdS = { padding:'11px 12px', borderBottom:`1px solid ${C.line}`, verticalAlign:'middle', fontSize:13 };

const PILL_MAP = {
  online:{bg:'#E7F8F0',c:'#0FA968'}, offline:{bg:'#FDECEB',c:'#E4483C'},
  on:{bg:'#EEF1FE',c:'#3B54D6'}, off:{bg:'#F1F2F6',c:'#9CA3AF'},
  warn:{bg:'#FDF3E0',c:'#DB8B12'}, alert:{bg:'#FDECEB',c:'#E4483C'},
  conn:{bg:'#E4F6FA',c:'#0891B2'}, ok:{bg:'#E7F8F0',c:'#0FA968'},
  aws:{bg:'#FFF1E4',c:'#C47300'}, sim:{bg:'#F3E8FF',c:'#7C5CE0'},
  admin:{bg:'#F1ECFC',c:'#7C5CE0'},
};

// ══════════════════════════════════════════════════
//  29 DEVICE TYPE REGISTRY
// ══════════════════════════════════════════════════
const PC = ['#DB8B12','#4F6EF7','#0891B2','#7C5CE0','#E4483C','#0FA968','#0EA5E9','#EA580C','#65A30D','#CA8A04','#059669','#6366F1','#DB2777','#0D9488','#9333EA','#F59E0B','#2563EB','#16A34A','#DC2626','#7C3AED','#0284C7','#B45309','#047857','#4338CA','#BE185D','#0F766E','#7E22CE','#92400E','#1D4ED8'];
const PB = ['#FDF3E0','#EEF1FE','#E4F6FA','#F1ECFC','#FDECEB','#E7F8F0','#E0F5FE','#FEEBDD','#EEF7DC','#FBF0D6','#DCF6EC','#E7E8FD','#FCE4F0','#DDF6F1','#F3E6FC','#FEF3D6','#DBEAFE','#DCFCE7','#FEE2E2','#EDE9FE','#E0F2FE','#FEF3C7','#D1FAE5','#E0E7FF','#FCE7F3','#CCFBF1','#F3E8FF','#FEF9C3','#DBEAFE'];

const TYPES = {
  street_light:{label:'Street Light',icon:'💡',primary:'load',unit:'W',controllable:true,energy:true},
  smart_meter:{label:'Smart Meter',icon:'🔢',primary:'load',unit:'W',controllable:true,energy:true},
  tank:{label:'Tank Level',icon:'🛢️',primary:'level',unit:'%',alertLow:20},
  motor:{label:'Motor Controller',icon:'⚙️',primary:'rpm',unit:'RPM',controllable:true},
  traffic:{label:'Traffic Signal',icon:'🚦',primary:'vehicles',unit:'/hr',controllable:true},
  parking:{label:'Smart Parking',icon:'🅿️',primary:'occupancy',unit:'%',alertHigh:90},
  water_quality:{label:'Water Quality',icon:'💧',primary:'ph',unit:'pH',alertLow:6.5,alertHigh:8.5},
  air_quality:{label:'Air Quality',icon:'🌫️',primary:'aqi',unit:'AQI',alertHigh:150},
  dustbin:{label:'Smart Dustbin',icon:'🗑️',primary:'fill',unit:'%',alertHigh:85},
  solar:{label:'Solar Analyzer',icon:'☀️',primary:'power',unit:'W',controllable:true,energy:true},
  soil_moisture:{label:'Soil Moisture',icon:'🌱',primary:'moisture',unit:'%',alertLow:25},
  weather_station:{label:'Weather Station',icon:'⛅',primary:'temp',unit:'°C'},
  gas_leak:{label:'Gas Detector',icon:'🧯',primary:'gasLevel',unit:'ppm',alertHigh:400},
  irrigation_valve:{label:'Irrigation Valve',icon:'🚿',primary:'flowRate',unit:'L/min',controllable:true},
  ev_charger:{label:'EV Charger',icon:'🔌',primary:'power',unit:'kW',controllable:true,energy:true},
  rain_wind:{label:'Rain & Wind',icon:'🌬️',primary:'windSpeed',unit:'km/h',alertHigh:60},
  industrial_machine:{label:'Industrial Machine',icon:'🏭',primary:'vibration',unit:'mm/s',alertHigh:7,controllable:true},
  agri_controller:{label:'Agri Controller',icon:'🌾',primary:'soilMoisture',unit:'%',alertLow:20,controllable:true},
  gps_tracker:{label:'GPS Tracker',icon:'🛰️',primary:'speed',unit:'km/h',controllable:true},
  building_gateway:{label:'Building Gateway',icon:'🏢',primary:'connectedDevices',unit:''},
  cctv_gateway:{label:'CCTV Gateway',icon:'📹',primary:'camerasOnline',unit:'',controllable:true},
  fleet_gateway:{label:'Fleet Gateway',icon:'🚚',primary:'vehiclesConnected',unit:''},
  smart_home:{label:'Smart Home',icon:'🏠',primary:'devicesConnected',unit:'',controllable:true},
  fire_alarm_gateway:{label:'Fire Alarm',icon:'🚨',primary:'activeAlarms',unit:'',alertHigh:0},
  smoke_detector:{label:'Smoke Detector',icon:'🔥',primary:'smokeLevel',unit:'%',alertHigh:40},
  irrigation_controller:{label:'Irrigation Ctrl',icon:'💦',primary:'flowRate',unit:'L/min',controllable:true},
  machine_monitor_unit:{label:'Machine Monitor',icon:'🧰',primary:'avgHealth',unit:'%',alertLow:60},
  water_flow_meter:{label:'Water Flow Meter',icon:'🚰',primary:'flowRate',unit:'L/min',controllable:true},
  generator_monitor:{label:'Generator Monitor',icon:'🔋',primary:'load',unit:'%',alertLow:15,controllable:true},
};
const TK = Object.keys(TYPES);
TK.forEach((k,i)=>{ TYPES[k].color=PC[i%PC.length]; TYPES[k].bg=PB[i%PB.length]; });

// ══════════════════════════════════════════════════
//  GENERATION
// ══════════════════════════════════════════════════
const LOCS = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur','Lucknow','Bhimavaram','Palakollu','Tadepalligudem','Vijayawada','Visakhapatnam','Guntur','Kakinada','Rajkot','Surat','Indore','Bhopal','Nagpur','Coimbatore','Madurai','Kochi','Thiruvananthapuram','Bhubaneswar','Patna','Chandigarh','Dehradun'];
const VENDORS = {
  street_light:['Signify','GE Lighting','Havells','Bajaj Electricals'],smart_meter:['L&T','Secure Meters','Genus','Landis+Gyr'],tank:['AquaSense','WaterTech','Grundfos'],motor:['Kirloskar','ABB','Siemens','WEG'],traffic:['Q-Free','Siemens','Yunex'],parking:['ParkSmart','Bosch','Swarco'],water_quality:['HydroLab','YSI','Hach'],air_quality:['AirSense','Vaisala','Aeroqual'],dustbin:['CleanTech','Bigbelly','Nordsense'],solar:['Luminous','Delta','SMA','Fronius'],soil_moisture:['AgroSense','Campbell','Davis'],weather_station:['Davis Instruments','Vaisala','Campbell'],gas_leak:['SafeAir','Honeywell','MSA'],irrigation_valve:['AgroSense','Rain Bird','Hunter'],ev_charger:['Exicom','ABB','Schneider'],rain_wind:['Davis Instruments','Vaisala','Gill'],industrial_machine:['Siemens','ABB','FANUC'],agri_controller:['AgroSense','Netafim','Lindsay'],gps_tracker:['Concox','Teltonika','Queclink'],building_gateway:['Honeywell','Johnson Controls','Siemens'],cctv_gateway:['Hikvision','Dahua','Axis'],fleet_gateway:['Concox','Teltonika','Geotab'],smart_home:['Google Nest','Amazon Echo','Samsung'],fire_alarm_gateway:['Honeywell','Siemens','Notifier'],smoke_detector:['Honeywell','Kidde','First Alert'],irrigation_controller:['AgroSense','Rain Bird','Toro'],machine_monitor_unit:['Siemens','Emerson','Fluke'],water_flow_meter:['Itron','Badger Meter','Kamstrup'],generator_monitor:['Cummins','Caterpillar','Kohler'],
};
const CONNS = ['WiFi','LTE','4G','NB-IoT','LoRa'];
let _did = 1;
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.round(rnd(a,b));
const pk=a=>a[Math.floor(Math.random()*a.length)];
const mkFW=()=>`v${ri(1,5)}.${ri(0,9)}.${ri(0,9)}`;
const fmt=(v,dec=1)=>typeof v==='number'?v.toFixed(dec):(v||'—');

function initV(type){
  switch(type){
    case 'street_light': return{voltage:rnd(220,250),current:rnd(0,2.5),load:rnd(0,500),energy:rnd(50,300),pf:rnd(0.85,1),temp:rnd(28,55)};
    case 'smart_meter': return{voltage:rnd(220,250),current:rnd(1,20),load:rnd(200,5000),energy:rnd(100,2000),pf:rnd(0.88,0.99),freq:rnd(49.5,50.5)};
    case 'tank': return{level:rnd(15,95),volume:rnd(500,15000),temp:rnd(20,38),pump:pk(['Running','Idle'])};
    case 'motor': return{voltage:rnd(380,440),current:rnd(4,25),rpm:rnd(800,3000),vibration:rnd(0.5,6),temp:rnd(35,85),runHours:rnd(0,15000)};
    case 'traffic': return{phase:pk(['Green','Yellow','Red']),cycle:rnd(60,120),vehicles:rnd(30,350),health:rnd(70,100)};
    case 'parking':{const t=ri(50,300),o=ri(0,t);return{total:t,occupied:o,available:t-o,occupancy:o/t*100,entries:ri(50,600),exits:ri(40,580),avgDuration:rnd(20,150),revenue:rnd(500,15000)};}
    case 'water_quality': return{ph:rnd(6.2,8.8),tds:rnd(100,900),turbidity:rnd(0.5,15),temp:rnd(18,35)};
    case 'air_quality': return{aqi:rnd(20,250),pm25:rnd(5,200),pm10:rnd(10,300),co2:rnd(350,1000),co:rnd(0.1,8),no2:rnd(5,120),temp:rnd(20,42),humidity:rnd(30,85)};
    case 'dustbin': return{fill:rnd(5,95),weight:rnd(2,60),lid:pk(['Open','Closed']),battery:rnd(15,100)};
    case 'solar': return{panelVoltage:rnd(300,460),panelCurrent:rnd(3,18),power:rnd(100,8000),generated:rnd(2,40),battery:rnd(30,100)};
    case 'soil_moisture': return{moisture:rnd(15,85),soilTemp:rnd(18,40),ec:rnd(0.3,4),battery:rnd(20,100)};
    case 'weather_station': return{temp:rnd(18,48),humidity:rnd(25,95),rainfall:rnd(0,25),windSpeed:rnd(0,50),pressure:rnd(990,1030)};
    case 'gas_leak': return{gasLevel:rnd(0,250),status:'Safe',temp:rnd(22,50),battery:rnd(30,100)};
    case 'irrigation_valve': return{flowRate:rnd(0,100),valveStatus:pk(['Open','Closed']),pressure:rnd(0.5,5),totalFlow:rnd(200,8000)};
    case 'ev_charger': return{voltage:rnd(210,250),current:rnd(6,32),power:rnd(1.5,22),sessionEnergy:rnd(5,80),connector:pk(['Connected','Idle'])};
    case 'rain_wind': return{rainfall:rnd(0,25),totalRainfall:rnd(5,100),windSpeed:rnd(0,60),windGust:rnd(5,90),windDirection:pk(['N','NE','E','SE','S','SW','W','NW'])};
    case 'industrial_machine': return{status:'Running',rpm:rnd(800,3500),current:rnd(5,35),vibration:rnd(0.5,9),temp:rnd(30,100),health:rnd(55,100),runHours:rnd(100,20000)};
    case 'agri_controller': return{soilMoisture:rnd(15,80),soilTemp:rnd(18,42),humidity:rnd(35,85),lightIntensity:rnd(2000,100000),pump:pk(['Running','Idle'])};
    case 'gps_tracker': return{speed:rnd(0,100),fuelLevel:rnd(10,100),ignition:pk(['ON','OFF']),odometer:rnd(1000,150000),location:'NH-16'};
    case 'building_gateway': return{connectedDevices:ri(10,300),temp:rnd(18,35),humidity:rnd(35,70),energyLoad:rnd(5,200),uptime:rnd(90,100)};
    case 'cctv_gateway': return{camerasOnline:ri(2,32),storageUsed:rnd(20,95),bandwidth:rnd(5,100),motionEvents:ri(50,800),recording:'Active'};
    case 'fleet_gateway': return{vehiclesConnected:ri(5,80),avgSpeed:rnd(20,80),activeTrips:ri(2,40),alertsToday:ri(0,15)};
    case 'smart_home': return{devicesConnected:ri(5,50),temp:rnd(19,32),humidity:rnd(35,70),energyUsage:rnd(2,25),mode:'Home'};
    case 'fire_alarm_gateway': return{zonesMonitored:ri(4,24),activeAlarms:Math.random()>0.98?1:0,batteryBackup:rnd(75,100),status:'Normal'};
    case 'smoke_detector': return{smokeLevel:rnd(0,25),temp:rnd(18,45),battery:rnd(30,100),status:'Clear'};
    case 'irrigation_controller': return{activeZone:`Zone ${ri(1,8)}`,flowRate:rnd(10,150),soilMoisture:rnd(20,75),waterUsedToday:rnd(100,8000),schedule:pk(['Active','Paused'])};
    case 'machine_monitor_unit': return{machinesMonitored:ri(2,15),avgVibration:rnd(1,8),faultsToday:ri(0,8),avgHealth:rnd(50,98)};
    case 'water_flow_meter': return{flowRate:rnd(30,350),totalVolume:rnd(5000,200000),pressure:rnd(0.5,6),temp:rnd(15,38)};
    case 'generator_monitor': return{status:pk(['Running','Standby']),fuelLevel:rnd(15,100),voltage:rnd(380,440),load:rnd(0,90),runHours:rnd(20,5000),temp:rnd(28,100)};
    default: return{value:rnd(0,100)};
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
    const vl=VENDORS[type]||['Generic'];
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

// ══════════════════════════════════════════════════
//  SIMULATION TICK
// ══════════════════════════════════════════════════
const rw=(v,d,mn,mx)=>Math.max(mn,Math.min(mx,v+(Math.random()-0.5)*d*2));

function tickDev(d){
  if(d.status==='offline'){
    if(Math.random()<0.02) return{...d,status:'online',power:'on'};
    return d;
  }
  if(Math.random()<0.005) return{...d,status:'offline',power:'off'};
  const v={...d.values};
  switch(d.type){
    case 'street_light': v.voltage=rw(v.voltage,5,210,260);v.current=rw(v.current,0.1,0,3);v.load=d.power==='on'?v.voltage*v.current:0;v.energy+=v.load/1000/60;v.pf=rw(v.pf,0.02,0.8,1);v.temp=rw(v.temp,1,20,70);break;
    case 'smart_meter': v.voltage=rw(v.voltage,3,215,255);v.current=rw(v.current,0.5,0,25);v.load=v.voltage*v.current;v.energy+=v.load/1000/60;v.pf=rw(v.pf,0.01,0.85,1);v.freq=rw(v.freq,0.05,49,51);break;
    case 'tank': v.level=rw(v.level,1,0,100);v.volume=v.level*150;v.temp=rw(v.temp,0.5,15,45);break;
    case 'motor': if(d.power==='on'){v.rpm=rw(v.rpm,50,0,3500);v.current=rw(v.current,0.5,0,30);v.vibration=rw(v.vibration,0.2,0,10);v.temp=rw(v.temp,1,30,95);v.runHours+=1/60;}else{v.rpm=0;v.current=0;}break;
    case 'traffic': v.vehicles=rw(v.vehicles,20,0,500);v.health=rw(v.health,0.5,50,100);v.cycle=rw(v.cycle,2,45,150);if(Math.random()<0.1)v.phase=['Green','Yellow','Red'][ri(0,2)];break;
    case 'parking': v.occupied=Math.max(0,Math.min(v.total,v.occupied+ri(-5,5)));v.available=v.total-v.occupied;v.occupancy=v.occupied/v.total*100;v.entries+=ri(0,5);v.exits+=ri(0,4);v.revenue+=Math.random()*100;break;
    case 'water_quality': v.ph=rw(v.ph,0.05,5.5,9.5);v.tds=rw(v.tds,5,50,1000);v.turbidity=rw(v.turbidity,0.2,0,20);v.temp=rw(v.temp,0.3,15,40);break;
    case 'air_quality': v.aqi=rw(v.aqi,10,0,300);v.pm25=rw(v.pm25,5,0,250);v.pm10=rw(v.pm10,8,0,350);v.co2=rw(v.co2,15,300,1200);v.temp=rw(v.temp,0.5,15,45);v.humidity=rw(v.humidity,1,20,95);break;
    case 'dustbin': v.fill=Math.min(100,v.fill+Math.random()*0.5);v.weight=v.fill*0.6;v.battery=Math.max(0,v.battery-Math.random()*0.05);if(v.fill>=100&&Math.random()<0.05)v.fill=ri(5,20);break;
    case 'solar': if(d.power==='on'){v.panelVoltage=rw(v.panelVoltage,10,200,480);v.panelCurrent=rw(v.panelCurrent,0.5,0,20);v.power=v.panelVoltage*v.panelCurrent;v.generated+=v.power/1000/60;}else{v.power=0;}v.battery=rw(v.battery,1,10,100);break;
    case 'soil_moisture': v.moisture=rw(v.moisture,1,0,100);v.soilTemp=rw(v.soilTemp,0.3,10,45);v.ec=rw(v.ec,0.05,0,5);v.battery=Math.max(0,v.battery-Math.random()*0.03);break;
    case 'weather_station': v.temp=rw(v.temp,0.5,10,50);v.humidity=rw(v.humidity,1,20,100);v.rainfall=Math.max(0,v.rainfall+(Math.random()<0.2?Math.random()*2:-Math.random()*0.5));v.windSpeed=rw(v.windSpeed,2,0,60);v.pressure=rw(v.pressure,0.5,980,1040);break;
    case 'gas_leak': v.gasLevel=rw(v.gasLevel,15,0,600);v.status=v.gasLevel>400?'Leak Detected':'Safe';v.temp=rw(v.temp,0.5,20,55);v.battery=Math.max(0,v.battery-Math.random()*0.03);break;
    case 'irrigation_valve': if(d.power==='on'){v.flowRate=rw(v.flowRate,5,0,120);v.pressure=rw(v.pressure,0.1,0.5,6);v.totalFlow+=v.flowRate/60;}else{v.flowRate=0;}break;
    case 'ev_charger': if(d.power==='on'){v.voltage=rw(v.voltage,2,200,260);v.current=rw(v.current,1,0,32);v.power=(v.voltage*v.current)/1000;v.sessionEnergy+=v.power/60;}else{v.power=0;v.current=0;}break;
    case 'rain_wind': v.rainfall=Math.max(0,v.rainfall+(Math.random()<0.2?Math.random()*3:-Math.random()*1));v.totalRainfall+=Math.max(0,v.rainfall)/60;v.windSpeed=rw(v.windSpeed,3,0,80);v.windGust=Math.max(v.windSpeed,rw(v.windGust,3,0,110));if(Math.random()<0.08)v.windDirection=['N','NE','E','SE','S','SW','W','NW'][ri(0,7)];break;
    case 'industrial_machine': if(d.power==='on'){v.rpm=rw(v.rpm,50,0,4000);v.current=rw(v.current,1,0,40);v.vibration=rw(v.vibration,0.3,0,12);v.temp=rw(v.temp,1,25,110);v.runHours+=1/60;v.health=rw(v.health,0.5,0,100);v.status=v.vibration>7?'Fault':'Running';}else{v.rpm=0;v.current=0;v.status='Idle';}break;
    case 'agri_controller': v.soilMoisture=rw(v.soilMoisture,1,0,100);v.soilTemp=rw(v.soilTemp,0.3,10,45);v.humidity=rw(v.humidity,1,20,95);v.lightIntensity=rw(v.lightIntensity,2000,0,120000);v.pump=d.power==='on'?'Running':'Idle';break;
    case 'gps_tracker': if(d.power==='on'){v.speed=rw(v.speed,10,0,120);v.odometer+=v.speed/60;v.fuelLevel=Math.max(0,v.fuelLevel-Math.random()*0.05);v.ignition='ON';}else{v.speed=0;v.ignition='OFF';}break;
    case 'building_gateway': v.connectedDevices=Math.max(0,v.connectedDevices+ri(-5,5));v.temp=rw(v.temp,0.3,18,40);v.humidity=rw(v.humidity,1,30,80);v.energyLoad=rw(v.energyLoad,3,0,250);v.uptime=rw(v.uptime,0.1,85,100);break;
    case 'cctv_gateway': v.camerasOnline=Math.max(0,v.camerasOnline+ri(-1,1));v.storageUsed=Math.min(100,v.storageUsed+Math.random()*0.1);v.bandwidth=rw(v.bandwidth,5,0,120);if(Math.random()<0.3)v.motionEvents+=ri(0,5);break;
    case 'fleet_gateway': v.vehiclesConnected=Math.max(0,v.vehiclesConnected+ri(-3,3));v.avgSpeed=rw(v.avgSpeed,5,0,100);v.activeTrips=Math.max(0,v.activeTrips+ri(-2,2));if(Math.random()<0.05)v.alertsToday+=1;break;
    case 'smart_home': v.devicesConnected=Math.max(0,v.devicesConnected+ri(-2,2));v.temp=rw(v.temp,0.3,18,35);v.humidity=rw(v.humidity,1,30,75);v.energyUsage+=Math.random()*0.05;break;
    case 'fire_alarm_gateway': v.batteryBackup=rw(v.batteryBackup,0.1,70,100);if(Math.random()<0.01&&v.activeAlarms===0)v.activeAlarms=1;else if(v.activeAlarms>0&&Math.random()<0.3)v.activeAlarms=0;v.status=v.activeAlarms>0?'Alarm':'Normal';break;
    case 'smoke_detector': v.smokeLevel=rw(v.smokeLevel,3,0,60);v.temp=rw(v.temp,0.3,15,65);v.battery=Math.max(0,v.battery-Math.random()*0.03);v.status=v.smokeLevel>40?'Smoke Detected':'Clear';break;
    case 'irrigation_controller': if(d.power==='on'){v.flowRate=rw(v.flowRate,5,0,150);v.waterUsedToday+=v.flowRate/60;}else{v.flowRate=0;}v.soilMoisture=rw(v.soilMoisture,1,0,100);break;
    case 'machine_monitor_unit': v.avgVibration=rw(v.avgVibration,0.3,0,12);v.avgHealth=rw(v.avgHealth,0.5,0,100);if(Math.random()<0.02)v.faultsToday+=1;break;
    case 'water_flow_meter': if(d.power==='on'){v.flowRate=rw(v.flowRate,10,0,400);v.totalVolume+=v.flowRate/60;v.pressure=rw(v.pressure,0.2,0,8);}else{v.flowRate=0;}v.temp=rw(v.temp,0.2,10,40);break;
    case 'generator_monitor': if(d.power==='on'){v.load=rw(v.load,3,0,100);v.voltage=rw(v.voltage,2,370,450);v.runHours+=1/60;v.fuelLevel=Math.max(0,v.fuelLevel-Math.random()*0.03);v.temp=rw(v.temp,1,30,120);v.status='Running';}else{v.status='Standby';v.load=0;}break;
    default:break;
  }
  const t=TYPES[d.type]; const pv=v[t.primary];
  const nh=typeof pv==='number'?[...d.history.slice(1),parseFloat(pv.toFixed(2))]:d.history;
  return{...d,values:v,history:nh};
}

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════
const hasAlert=d=>{const t=TYPES[d.type];if(d.status!=='online')return false;const v=d.values[t.primary];if(typeof v!=='number')return false;if(t.alertHigh!=null&&v>t.alertHigh)return true;if(t.alertLow!=null&&v<t.alertLow)return true;return false;};
const nowStr=()=>new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

// ══════════════════════════════════════════════════
//  PRIMITIVES
// ══════════════════════════════════════════════════
function Pill({type='off',children,style={}}){
  const s=PILL_MAP[type]||PILL_MAP.off;
  return <span style={{background:s.bg,color:s.c,fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,whiteSpace:'nowrap',display:'inline-block',letterSpacing:'.02em',...style}}>{children}</span>;
}

function Btn({v='primary',onClick,disabled,children,style={},title}){
  const variants={primary:{bg:C.blue,c:'#fff',border:'none'},ghost:{bg:C.bg,c:C.ink,border:'none'},outline:{bg:'#fff',c:C.ink,border:`1px solid ${C.line}`},danger:{bg:C.redBg,c:C.red,border:'none'}};
  const s=variants[v]||variants.primary;
  return <button title={title} style={{background:s.bg,color:s.c,border:s.border,borderRadius:9,padding:'8px 15px',fontWeight:700,fontSize:13,cursor:disabled?'not-allowed':'pointer',display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',lineHeight:1,opacity:disabled?.48:1,...style}} onClick={disabled?undefined:onClick} disabled={disabled}>{children}</button>;
}

function Input({value,onChange,placeholder,type='text',style={},onKeyDown}){
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={{...inpStyle,...style}}/>;
}
function Select({value,onChange,children,style={}}){
  return <select value={value} onChange={onChange} style={{...inpStyle,width:'auto',...style}}>{children}</select>;
}
function Textarea({value,onChange,placeholder,rows=4,style={}}){
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{...inpStyle,resize:'vertical',...style}}/>;
}

function Field({label,hint,children}){
  return <div style={{marginBottom:14}}>
    {label&&<label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:6,color:C.soft}}>{label}</label>}
    {children}
    {hint&&<div style={{fontSize:11,color:C.faint,marginTop:4}}>{hint}</div>}
  </div>;
}

function Modal({show,onClose,title,children,wide=false,maxWidth}){
  if(!show)return null;
  return <div style={{position:'fixed',inset:0,background:'rgba(17,24,39,.52)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:'#fff',borderRadius:16,padding:24,width:'100%',maxWidth:maxWidth||(wide?660:440),boxShadow:'0 20px 60px rgba(0,0,0,.25)',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
        <h3 style={{margin:0,fontSize:17}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:C.faint,lineHeight:1,padding:0}}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

function Toast({toasts}){
  return <div style={{position:'fixed',top:18,right:18,zIndex:300,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
    {toasts.map(t=><div key={t.id} style={{background:'#fff',borderLeft:`4px solid ${t.err?C.red:C.green}`,boxShadow:'0 4px 24px rgba(0,0,0,.14)',borderRadius:9,padding:'11px 16px',fontSize:13,minWidth:240,lineHeight:1.4}}>{t.msg}</div>)}
  </div>;
}

function StatCard({label,value,delta,color=C.blue,icon}){
  return <div style={{background:'#fff',borderRadius:14,padding:'16px 18px',boxShadow:SHADOW}}>
    <div style={{fontSize:12,color:C.faint,fontWeight:600,display:'flex',alignItems:'center',gap:6}}>{icon&&<span>{icon}</span>}{label}</div>
    <div style={{fontSize:26,fontWeight:800,marginTop:6,color}}>{value}</div>
    {delta&&<div style={{fontSize:11.5,marginTop:4,color:C.soft}}>{delta}</div>}
  </div>;
}

function Pagination({page,total,pageSize,onChange}){
  const totalPages=Math.ceil(total/pageSize);
  if(totalPages<=1)return null;
  return <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16,alignItems:'center',flexWrap:'wrap'}}>
    <Btn v="ghost" onClick={()=>onChange(Math.max(1,page-1))} disabled={page===1}>‹ Prev</Btn>
    {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
      let p;
      if(totalPages<=5)p=i+1;
      else if(page<=3)p=i+1;
      else if(page>=totalPages-2)p=totalPages-4+i;
      else p=page-2+i;
      return <button key={p} onClick={()=>onChange(p)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${p===page?C.blue:C.line}`,background:p===page?C.blue:'#fff',color:p===page?'#fff':C.ink,fontWeight:700,fontSize:13,cursor:'pointer'}}>{p}</button>;
    })}
    <Btn v="ghost" onClick={()=>onChange(Math.min(totalPages,page+1))} disabled={page===totalPages}>Next ›</Btn>
    <span style={{fontSize:12,color:C.faint}}>{total.toLocaleString()} total</span>
  </div>;
}

// ══════════════════════════════════════════════════
//  DEVICE CARD (memoised)
// ══════════════════════════════════════════════════
const DeviceCard=memo(({d,onView,onRename})=>{
  const [hover,setHover]=useState(false);
  const t=TYPES[d.type]; const pv=d.values[t.primary]; const alert=hasAlert(d);
  const secondaryKeys=Object.keys(d.values).filter(k=>k!==t.primary).slice(0,4);
  return <div onClick={()=>onView(d.id)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{background:'#fff',borderRadius:14,padding:16,boxShadow:hover?`0 4px 20px ${t.color}22`:SHADOW,cursor:'pointer',border:`1.5px solid ${hover?t.color:'transparent'}`,transition:'border-color .15s,box-shadow .15s'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
      <div style={{display:'flex',gap:10,minWidth:0}}>
        <div style={{width:38,height:38,borderRadius:10,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{t.icon}</div>
        <div style={{minWidth:0}}>
          <div style={{fontWeight:800,fontSize:12,lineHeight:1.3,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}}>{d.name}</div>
          <div style={{fontSize:10.5,color:C.faint,marginTop:2}}>{d.location} · <span style={{color:t.color,fontWeight:700}}>{t.label}</span></div>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
        <Pill type={d.status}>{d.status==='online'?'Online':'Offline'}</Pill>
        <Pill type="conn">{d.conn}</Pill>
      </div>
    </div>
    <div style={{textAlign:'center',margin:'12px 0 8px'}}>
      <b style={{fontSize:26,color:t.color}}>{typeof pv==='number'?fmt(pv,1):(pv||'—')}</b>
      <span style={{display:'block',fontSize:10,color:C.faint,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',marginTop:2}}>{t.unit||t.primary}</span>
    </div>
    <div style={{textAlign:'center',marginBottom:8}}>
      {alert?<Pill type="alert">⚠ Needs attention</Pill>:<Pill type={d.power==='on'?'on':'off'}>{d.power==='on'?'ACTIVE':'INACTIVE'}</Pill>}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:4}}>
      {secondaryKeys.map(k=>{const sv=d.values[k];return<div key={k} style={{background:C.bg,borderRadius:7,padding:'5px 8px'}}>
        <b style={{display:'block',fontSize:12}}>{typeof sv==='number'?fmt(sv,1):(sv||'—')}</b>
        <span style={{fontSize:10,color:C.faint}}>{k}</span>
      </div>;})}
    </div>
    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,alignItems:'center'}}>
      <button onClick={e=>{e.stopPropagation();onRename(d);}} style={{background:'none',border:'none',fontSize:11,color:C.blue,cursor:'pointer',fontWeight:700,padding:0}}>✏ Rename</button>
      <span style={{fontSize:10.5,color:C.faint}}>{d.vendor}</span>
    </div>
  </div>;
});

// ══════════════════════════════════════════════════
//  OVERVIEW VIEW
// ══════════════════════════════════════════════════
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
  const online=useMemo(()=>devices.filter(d=>d.status==='online').length,[devices]);
  const offline=useMemo(()=>devices.length-online,[devices,online]);
  const alerts=useMemo(()=>devices.filter(hasAlert).length,[devices]);
  const active=useMemo(()=>devices.filter(d=>d.power==='on').length,[devices]);

  const filtered=useMemo(()=>devices.filter(d=>{
    if(typeFilter&&d.type!==typeFilter)return false;
    if(statusF&&d.status!==statusF)return false;
    if(connF&&d.conn!==connF)return false;
    if(locF&&d.location!==locF)return false;
    if(alertF&&!hasAlert(d))return false;
    if(search){const q=search.toLowerCase();if(!d.name.toLowerCase().includes(q)&&!d.location.toLowerCase().includes(q))return false;}
    return true;
  }),[devices,typeFilter,statusF,connF,locF,alertF,search]);

  const totalPages=Math.ceil(filtered.length/PER);
  const visible=filtered.slice((page-1)*PER,page*PER);
  const resetPage=()=>setPage(1);

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20}}>
      <StatCard label="Total Devices" value={devices.length.toLocaleString()} delta="Across all types" color={C.blue} icon="📡"/>
      <StatCard label="Online" value={online.toLocaleString()} delta={`${((online/devices.length)*100).toFixed(1)}% fleet uptime`} color={C.green} icon="✅"/>
      <StatCard label="Offline" value={offline.toLocaleString()} delta="Need attention" color={C.red} icon="❌"/>
      <StatCard label="Active" value={active.toLocaleString()} delta="Currently powered on" color={C.teal} icon="⚡"/>
      <StatCard label="Alerts" value={alerts.toLocaleString()} delta="Threshold breaches" color={C.amber} icon="⚠️"/>
      <StatCard label="Device Types" value={Object.keys(typeCounts).length} delta="Module types deployed" color={C.purple} icon="🧩"/>
    </div>

    <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Device Types <span style={{color:C.faint,fontWeight:400,fontSize:12}}>— tap to filter</span></div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
      {[{key:'',label:'All',count:devices.length,color:C.blue,bg:C.blueLight},...Object.keys(typeCounts).map(tk=>({key:tk,label:`${TYPES[tk].icon} ${TYPES[tk].label}`,count:typeCounts[tk],color:TYPES[tk].color,bg:TYPES[tk].bg}))].map(item=>{
        const act=typeFilter===item.key;
        return <div key={item.key} onClick={()=>{setTypeFilter(act&&item.key?'':item.key);resetPage();}}
          style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${act?item.color:C.line}`,background:act?item.color:'#fff',color:act?'#fff':C.soft,fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5,transition:'all .15s'}}>
          {!act&&item.key&&<span style={{width:7,height:7,borderRadius:'50%',background:item.color,display:'inline-block',flexShrink:0}}/>}
          {item.label} <span style={{opacity:.7,fontWeight:600}}>{item.count}</span>
        </div>;
      })}
    </div>

    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
      <Input value={search} onChange={e=>{setSearch(e.target.value);resetPage();}} placeholder="Search devices or locations…" style={{width:220}}/>
      <Select value={statusF} onChange={e=>{setStatusF(e.target.value);resetPage();}}><option value="">All Status</option><option value="online">Online</option><option value="offline">Offline</option></Select>
      <Select value={connF} onChange={e=>{setConnF(e.target.value);resetPage();}}><option value="">All Connectivity</option>{CONNS.map(c=><option key={c} value={c}>{c}</option>)}</Select>
      <Select value={locF} onChange={e=>{setLocF(e.target.value);resetPage();}}><option value="">All Locations</option>{locs.map(l=><option key={l} value={l}>{l}</option>)}</Select>
      <Select value={alertF} onChange={e=>{setAlertF(e.target.value);resetPage();}}><option value="">All Devices</option><option value="1">Needs Attention</option></Select>
      {(search||statusF||connF||locF||alertF||typeFilter)&&<Btn v="ghost" onClick={()=>{setSearch('');setStatusF('');setConnF('');setLocF('');setAlertF('');setTypeFilter('');setPage(1);}}>✕ Clear</Btn>}
      <span style={{fontSize:12,color:C.faint,marginLeft:'auto'}}>Showing {visible.length} of {filtered.length.toLocaleString()}</span>
    </div>

    {visible.length===0
      ?<div style={{textAlign:'center',padding:'40px 20px',color:C.faint}}>No devices match your filters.</div>
      :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(258px,1fr))',gap:14}}>
        {visible.map(d=><DeviceCard key={d.id} d={d} onView={onView} onRename={onRename}/>)}
      </div>}
    <Pagination page={page} total={filtered.length} pageSize={PER} onChange={setPage}/>
  </div>;
}

// ══════════════════════════════════════════════════
//  ALL DEVICES TABLE VIEW
// ══════════════════════════════════════════════════
function DevicesView({devices,onView,onRename,onAdd,addLog,addToast}){
  const [page,setPage]=useState(1);
  const [search,setSearch]=useState('');
  const [statusF,setStatusF]=useState('');
  const [connF,setConnF]=useState('');
  const [typeF,setTypeF]=useState('');
  const PER=25;

  const types=useMemo(()=>[...new Set(devices.map(d=>d.type))].sort(),[devices]);
  const filtered=useMemo(()=>devices.filter(d=>{
    if(statusF&&d.status!==statusF)return false;
    if(connF&&d.conn!==connF)return false;
    if(typeF&&d.type!==typeF)return false;
    if(search){const q=search.toLowerCase();if(!d.name.toLowerCase().includes(q)&&!d.location.toLowerCase().includes(q)&&!d.vendor.toLowerCase().includes(q))return false;}
    return true;
  }),[devices,search,statusF,connF,typeF]);
  const visible=useMemo(()=>filtered.slice((page-1)*PER,page*PER),[filtered,page]);
  const resetPage=()=>setPage(1);

  const exportJSON=()=>{const data=JSON.stringify(devices.map(({id,type,name,location,vendor,conn,status,fw})=>({id,type,name,location,vendor,conn,status,fw})),null,2);const a=document.createElement('a');a.href='data:application/json,'+encodeURIComponent(data);a.download='kgp-devices-export.json';a.click();addToast('Exported as JSON');};
  const exportCSV=()=>{const h='id,type,name,location,vendor,conn,status,fw\n';const rows=devices.map(d=>`${d.id},${d.type},"${d.name}","${d.location}","${d.vendor}",${d.conn},${d.status},${d.fw}`).join('\n');const a=document.createElement('a');a.href='data:text/csv,'+encodeURIComponent(h+rows);a.download='kgp-devices.csv';a.click();addToast('Exported as CSV');};
  const reboot=d=>{addLog(d.name,'Admin','Reboot command sent','Manual reboot from device table');addToast(`Reboot sent → ${d.name}`);};

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
      <div><h2 style={{margin:0,fontSize:16,fontWeight:800}}>Device Registry</h2><p style={{margin:'3px 0 0',fontSize:12,color:C.faint}}>Full inventory of {devices.length.toLocaleString()} devices across all types</p></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <Btn v="ghost" onClick={exportCSV}>⬇ CSV</Btn>
        <Btn v="ghost" onClick={exportJSON}>⬇ JSON</Btn>
        <Btn v="primary" onClick={onAdd}>+ Add Device</Btn>
      </div>
    </div>
    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
      <Input value={search} onChange={e=>{setSearch(e.target.value);resetPage();}} placeholder="Search name, location, vendor…" style={{width:240}}/>
      <Select value={statusF} onChange={e=>{setStatusF(e.target.value);resetPage();}}><option value="">All Status</option><option value="online">Online</option><option value="offline">Offline</option></Select>
      <Select value={connF} onChange={e=>{setConnF(e.target.value);resetPage();}}><option value="">All Connectivity</option>{CONNS.map(c=><option key={c} value={c}>{c}</option>)}</Select>
      <Select value={typeF} onChange={e=>{setTypeF(e.target.value);resetPage();}}><option value="">All Types</option>{types.map(t=><option key={t} value={t}>{TYPES[t].icon} {TYPES[t].label}</option>)}</Select>
      {(search||statusF||connF||typeF)&&<Btn v="ghost" onClick={()=>{setSearch('');setStatusF('');setConnF('');setTypeF('');setPage(1);}}>✕ Clear</Btn>}
      <span style={{fontSize:12,color:C.faint,marginLeft:'auto'}}>{filtered.length.toLocaleString()} of {devices.length.toLocaleString()}</span>
    </div>
    <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead><tr style={{background:C.bg}}>
          {['Device','Type','Location','Connectivity','Status','Key Reading','Firmware','Alert','Actions'].map(h=><th key={h} style={thS}>{h}</th>)}
        </tr></thead>
        <tbody>
          {visible.length===0?<tr><td colSpan={9} style={{...tdS,textAlign:'center',padding:'40px 20px',color:C.faint}}>No devices match your filters.</td></tr>:visible.map(d=>{
            const t=TYPES[d.type];const pv=d.values[t.primary];const al=hasAlert(d);
            return <tr key={d.id} onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background=''} style={{transition:'background .12s'}}>
              <td style={tdS}><div style={{fontWeight:700,fontSize:12,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div><div style={{fontSize:11,color:C.faint}}>{d.vendor}</div></td>
              <td style={tdS}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 9px',borderRadius:20,fontSize:11,whiteSpace:'nowrap'}}>{t.icon} {t.label}</span></td>
              <td style={tdS}>{d.location}</td>
              <td style={tdS}><Pill type="conn">{d.conn}</Pill></td>
              <td style={tdS}><Pill type={d.status}>{d.status}</Pill></td>
              <td style={{...tdS,fontWeight:600}}>{typeof pv==='number'?pv.toFixed(1):(pv||'—')} {typeof pv==='number'?t.unit:''}</td>
              <td style={tdS}><code style={{fontSize:11}}>{d.fw||'—'}</code>{d.fw&&d.latestFw&&d.fw!==d.latestFw&&<span style={{fontSize:9.5,background:C.amberBg,color:C.amber,padding:'2px 6px',borderRadius:6,marginLeft:5}}>update</span>}</td>
              <td style={tdS}>{al?<Pill type="alert">⚠ Alert</Pill>:<Pill type="ok">OK</Pill>}</td>
              <td style={tdS}><div style={{display:'flex',gap:6}}>
                <Btn v="ghost" style={{padding:'5px 10px',fontSize:11}} onClick={()=>onView(d.id)}>View →</Btn>
                <Btn v="ghost" style={{padding:'5px 10px',fontSize:11}} onClick={()=>onRename(d)}>✏</Btn>
                <Btn v="ghost" style={{padding:'5px 10px',fontSize:11}} onClick={()=>reboot(d)}>🔁</Btn>
              </div></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    <Pagination page={page} total={filtered.length} pageSize={PER} onChange={setPage}/>
  </div>;
}

// ══════════════════════════════════════════════════
//  DEVICE DETAIL VIEW
// ══════════════════════════════════════════════════
function DetailView({d,onBack,onRename,onControl}){
  if(!d)return<div style={{padding:40,color:C.faint,textAlign:'center'}}>Device not found.</div>;
  const t=TYPES[d.type];const pv=d.values[t.primary];const alert=hasAlert(d);
  const metricKeys=Object.keys(d.values).slice(0,8);
  const chartData=d.history.map((v,i)=>({i,v:parseFloat(v.toFixed?v.toFixed(2):v)}));

  const genINO=()=>{
    const code=`// KGP Innovation — Auto-Generated Firmware\n// Device: ${d.name}\n// Type: ${t.label}\n// Generated: ${new Date().toLocaleString()}\n\n#include <WiFi.h>\n#include <WiFiClientSecure.h>\n#include <PubSubClient.h>\n#include <ArduinoJson.h>\n\nconst char* SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASS = "YOUR_WIFI_PASSWORD";\nconst char* AWS_HOST = "YOUR_ENDPOINT.iot.ap-south-1.amazonaws.com";\nconst int   AWS_PORT = 8883;\nconst char* THING_NAME = "${d.id}";\nconst char* PUB_TOPIC = "devices/${d.id}/telemetry";\nconst char* SUB_TOPIC = "devices/${d.id}/commands";\n\n// Paste TLS certs from AWS Console here\nstatic const char ROOT_CA[] PROGMEM = R\"EOF(\n-----BEGIN CERTIFICATE-----\n<AmazonRootCA1.pem>\n-----END CERTIFICATE-----\n)EOF\";\n\nWiFiClientSecure net;\nPubSubClient client(net);\n\nvoid onMessage(char* topic, byte* payload, unsigned int len) {\n  StaticJsonDocument<256> cmd;\n  if (deserializeJson(cmd, payload, len) == DeserializationError::Ok) {\n    const char* action = cmd["action"];\n    if (strcmp(action, "power_on")  == 0) { /* turn on  */ }\n    if (strcmp(action, "power_off") == 0) { /* turn off */ }\n    if (strcmp(action, "reboot")    == 0) { ESP.restart(); }\n  }\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(SSID, WIFI_PASS);\n  while (WiFi.status() != WL_CONNECTED) { delay(500); }\n  net.setInsecure(); // Replace with proper certs\n  client.setServer(AWS_HOST, AWS_PORT);\n  client.setCallback(onMessage);\n  while (!client.connect(THING_NAME)) { delay(1000); }\n  client.subscribe(SUB_TOPIC);\n}\n\nvoid loop() {\n  if (!client.connected()) { while(!client.connect(THING_NAME)){delay(1000);} }\n  client.loop();\n  static unsigned long last = 0;\n  if (millis() - last >= 60000UL) {\n    last = millis();\n    StaticJsonDocument<512> doc;\n    doc["device_id"] = THING_NAME;\n    doc["device_type"] = "${d.type}";\n    doc["location"] = "${d.location}";\n    doc["ts"] = millis();\n${Object.keys(d.values).slice(0,6).map((k,i)=>`    doc["${k}"] = analogRead(A${i}) / 4095.0 * 100; // calibrate for ${k}`).join('\n')}\n    String payload; serializeJson(doc, payload);\n    client.publish(PUB_TOPIC, payload.c_str());\n  }\n}`;
    const a=document.createElement('a');a.href='data:text/plain,'+encodeURIComponent(code);a.download=d.id+'.ino';a.click();
  };

  return <div>
    <div style={{marginBottom:14}}>
      <span style={{color:C.blue,cursor:'pointer',fontWeight:700,fontSize:13}} onClick={onBack}>← Back to Fleet Overview</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:16}}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={cardStyle}>
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
            <b style={{fontSize:32,color:t.color}}>{typeof pv==='number'?fmt(pv,1):(pv||'—')} {typeof pv==='number'?t.unit:''}</b>
            <span style={{display:'block',fontSize:11,color:C.faint,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',marginTop:4}}>{t.primary}</span>
            {alert&&<div style={{marginTop:8}}><Pill type="alert">⚠ Alert — threshold exceeded</Pill></div>}
          </div>
          <div style={{textAlign:'center',color:C.faint,fontSize:12,marginBottom:12}}>Firmware {d.fw||'—'}{d.fw&&d.latestFw&&d.fw!==d.latestFw&&<span style={{color:C.amber,fontWeight:700}}> · update available → {d.latestFw}</span>}</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <Btn v="ghost" onClick={()=>onRename(d)}>✏ Rename Device</Btn>
            {t.controllable&&<Btn v="primary" onClick={()=>onControl(d)}>⚙ Control</Btn>}
          </div>
        </div>

        {t.controllable&&<div style={cardStyle}>
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
        </div>}

        <div style={cardStyle}>
          <b style={{fontSize:13}}>Firmware</b>
          <p style={{margin:'4px 0 12px',fontSize:12,color:C.faint}}>Auto-generated Arduino sketch for AWS IoT Core</p>
          <Btn v="outline" onClick={genINO}>📄 Download .ino Sketch</Btn>
        </div>

        <div style={cardStyle}>
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

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={cardStyle}>
          <b style={{fontSize:13}}>Live Telemetry</b>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginTop:10}}>
            {metricKeys.map(k=>{const v=d.values[k];return<div key={k} style={{background:C.bg,borderRadius:10,padding:12}}>
              <div style={{fontSize:15,fontWeight:800,color:t.color}}>{typeof v==='number'?fmt(v,1):(v||'—')}</div>
              <div style={{fontSize:10.5,color:C.faint,marginTop:2}}>{k}</div>
            </div>;})}
          </div>
        </div>

        <div style={cardStyle}>
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
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════
//  ANALYTICS VIEW
// ══════════════════════════════════════════════════
function AnalyticsView({devices}){
  const [selId,setSelId]=useState('');
  const selDev=useMemo(()=>selId?devices.find(d=>d.id===selId):devices[0],[selId,devices]);
  const typeData=useMemo(()=>{const c={};devices.forEach(d=>c[d.type]=(c[d.type]||0)+1);return Object.entries(c).map(([k,v])=>({name:TYPES[k].label,value:v,color:TYPES[k].color}));},[devices]);
  const connData=useMemo(()=>{const c={};devices.forEach(d=>c[d.conn]=(c[d.conn]||0)+1);return Object.entries(c).map(([k,v])=>({name:k,value:v}));},[devices]);
  const statusByLoc=useMemo(()=>{const c={};devices.forEach(d=>{if(!c[d.location])c[d.location]={loc:d.location,online:0,offline:0};c[d.location][d.status]++;});return Object.values(c).sort((a,b)=>(b.online+b.offline)-(a.online+a.offline)).slice(0,10);},[devices]);
  const alertsByType=useMemo(()=>Object.keys(TYPES).map(tk=>({name:TYPES[tk].label.substring(0,14),alerts:devices.filter(d=>d.type===tk&&hasAlert(d)).length})).filter(x=>x.alerts>0),[devices]);

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
      <div><h2 style={{margin:0,fontSize:16,fontWeight:800}}>Analytics</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Fleet composition, trends, and alert distribution</p></div>
      <Select value={selId} onChange={e=>setSelId(e.target.value)} style={{width:260}}>
        {devices.slice(0,100).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
      </Select>
    </div>

    {selDev&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <div style={cardStyle}>
        <b style={{fontSize:13}}>{selDev.name} — Primary Metric Trend</b>
        <div style={{height:200,marginTop:10}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selDev.history.map((v,i)=>({i,v:parseFloat((v||0).toFixed(2))}))}>
              <XAxis dataKey="i" hide/><YAxis hide/>
              <Tooltip formatter={v=>[fmt(v,2),TYPES[selDev.type].primary]}/>
              <Area type="monotone" dataKey="v" stroke={TYPES[selDev.type].color} fill={TYPES[selDev.type].bg} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={cardStyle}>
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
    </div>}

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <div style={cardStyle}>
        <b style={{fontSize:13}}>Connectivity Mix</b>
        <div style={{height:200,marginTop:10}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={connData}><XAxis dataKey="name" tick={{fontSize:12}}/><YAxis hide/><Tooltip/><Bar dataKey="value" fill={C.blue} radius={[4,4,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={cardStyle}>
        <b style={{fontSize:13}}>Online vs Offline by Location</b>
        <div style={{height:200,marginTop:10}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusByLoc}><XAxis dataKey="loc" tick={{fontSize:10}}/><YAxis hide/><Tooltip/><Legend/><Bar dataKey="online" fill={C.green} stackId="a"/><Bar dataKey="offline" fill={C.red} stackId="a" radius={[4,4,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {alertsByType.length>0&&<div style={cardStyle}>
      <b style={{fontSize:13}}>Alert Distribution by Device Type</b>
      <div style={{height:180,marginTop:10}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={alertsByType}><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis hide/><Tooltip/><Bar dataKey="alerts" fill={C.amber} radius={[4,4,0,0]}/></BarChart>
        </ResponsiveContainer>
      </div>
    </div>}
  </div>;
}

// ══════════════════════════════════════════════════
//  OTA VIEW
// ══════════════════════════════════════════════════
function OtaView({devices,addLog,addToast}){
  const [pushed,setPushed]=useState(new Set());
  const eligible=useMemo(()=>devices.filter(d=>d.fw&&d.latestFw&&d.fw!==d.latestFw),[devices]);
  const push=id=>{setPushed(s=>new Set([...s,id]));addToast('OTA pushed to device');addLog('OTA Firmware Update','Admin',`Pushed to ${devices.find(d=>d.id===id)?.name}`,'Routine update');};
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
      <div><h2 style={{margin:0,fontSize:16,fontWeight:800}}>OTA Firmware Updates</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>{eligible.length} devices eligible for update</p></div>
      <Btn v="primary" onClick={()=>eligible.forEach(d=>push(d.id))}>⬆ Push All Updates</Btn>
    </div>
    <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:C.bg}}>{['Device','Type','Current','Latest','Status','Action'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
        <tbody>
          {eligible.length===0?<tr><td colSpan={6} style={{...tdS,textAlign:'center',color:C.faint}}>All devices are up to date ✅</td></tr>:eligible.map(d=>{
            const t=TYPES[d.type];const done=pushed.has(d.id);
            return <tr key={d.id}>
              <td style={tdS}><b style={{fontSize:12}}>{d.name}</b></td>
              <td style={tdS}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 8px',borderRadius:20,fontSize:11}}>{t.icon} {t.label}</span></td>
              <td style={tdS}><code style={{fontSize:12}}>{d.fw}</code></td>
              <td style={tdS}><code style={{fontSize:12,color:C.green}}>{d.latestFw}</code></td>
              <td style={tdS}>{done?<Pill type="on">✓ Pushed</Pill>:<Pill type="warn">Pending</Pill>}</td>
              <td style={tdS}><Btn v={done?'ghost':'primary'} style={{fontSize:11,padding:'5px 10px'}} onClick={()=>push(d.id)} disabled={done}>{done?'Done':'⬆ Push'}</Btn></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════
//  LOGS VIEW
// ══════════════════════════════════════════════════
function LogsView({logs}){
  return <div>
    <div style={{marginBottom:16}}><h2 style={{margin:0,fontSize:16,fontWeight:800}}>Audit Logs</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Every action logged with operator and reason</p></div>
    <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:C.bg}}>{['Time','Device','User','Action','Reason'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
        <tbody>
          {logs.length===0?<tr><td colSpan={5} style={{...tdS,textAlign:'center',color:C.faint}}>No audit log entries yet.</td></tr>:logs.map((l,i)=>(
            <tr key={i}><td style={{...tdS,color:C.faint,fontSize:11,whiteSpace:'nowrap'}}>{l.time}</td><td style={tdS}><b style={{fontSize:12}}>{l.device}</b></td><td style={tdS}>{l.user}</td><td style={tdS}>{l.action}</td><td style={{...tdS,color:C.soft}}>{l.reason}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════
//  USERS VIEW
// ══════════════════════════════════════════════════
function UsersView({users,setUsers,addToast}){
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',email:'',role:'Operator',password:''});
  const addUser=()=>{if(!form.name||!form.email){addToast('Name and email required',true);return;}setUsers(u=>[...u,{id:'u'+Date.now(),...form}]);setShowAdd(false);setForm({name:'',email:'',role:'Operator',password:''});addToast('User created');};
  const roleColor={Admin:{bg:C.purpleBg,c:C.purple},Operator:{bg:C.blueLight,c:C.blueDark},Viewer:{bg:'#F1F2F6',c:C.soft}};
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div><h2 style={{margin:0,fontSize:16,fontWeight:800}}>Users & Roles</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Role-based access control</p></div>
      <Btn v="primary" onClick={()=>setShowAdd(true)}>+ Add User</Btn>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <div style={cardStyle}>
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
      <div style={cardStyle}>
        <b>User Summary</b>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:12}}>
          {['Admin','Operator','Viewer'].map(r=>{const rc=roleColor[r];const cnt=users.filter(u=>u.role===r).length;return<div key={r} style={{background:rc.bg,borderRadius:10,padding:12,textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:rc.c}}>{cnt}</div>
            <div style={{fontSize:11,color:rc.c,fontWeight:700,marginTop:4}}>{r}s</div>
          </div>;})}
        </div>
      </div>
    </div>
    <div style={{...cardStyle,padding:0}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:C.bg}}>{['User','Email','Role','Password'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
        <tbody>
          {users.map(u=>{const rc=roleColor[u.role]||roleColor.Viewer;return<tr key={u.id}>
            <td style={tdS}><b>{u.name}</b></td>
            <td style={{...tdS,color:C.faint}}>{u.email}</td>
            <td style={tdS}><span style={{background:rc.bg,color:rc.c,fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20}}>{u.role}</span></td>
            <td style={{...tdS,color:C.faint,fontFamily:'monospace',letterSpacing:2}}>{'●'.repeat(u.password?.length||6)}</td>
          </tr>;})}
        </tbody>
      </table>
    </div>
    <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="+ Add User">
      <Field label="Full Name *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Priya Sharma"/></Field>
      <Field label="Email *"><Input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="name@company.com"/></Field>
      <Field label="Role"><Select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{width:'100%'}}><option>Admin</option><option>Operator</option><option>Viewer</option></Select></Field>
      <Field label="Password *"><Input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Temporary password"/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
        <Btn v="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
        <Btn v="primary" onClick={addUser}>Create User</Btn>
      </div>
    </Modal>
  </div>;
}

// ══════════════════════════════════════════════════
//  REPORTS VIEW
// ══════════════════════════════════════════════════
function ReportsView({devices,awsCfg}){
  const [tab,setTab]=useState('energy');
  const energyDevs=useMemo(()=>devices.filter(d=>TYPES[d.type].energy),[devices]);
  const rate=parseFloat(awsCfg.tariff)||7.5;
  const fixed=parseFloat(awsCfg.fixedCharge)||25;
  const totalEnergy=energyDevs.reduce((s,d)=>s+(d.values.energy||d.values.generated||d.values.sessionEnergy||0),0);
  const totalBill=energyDevs.length*fixed+totalEnergy*rate;
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
      <div><h2 style={{margin:0,fontSize:16,fontWeight:800}}>Reports & Billing</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>Energy billing and fleet monitoring reports</p></div>
      <div style={{display:'flex',gap:8}}>
        {['energy','monitoring'].map(t=><Btn key={t} v={tab===t?'primary':'ghost'} onClick={()=>setTab(t)}>{t==='energy'?'Energy Billing':'Monitoring Report'}</Btn>)}
      </div>
    </div>
    {tab==='energy'&&<>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:20}}>
        <StatCard label="Energy Devices" value={energyDevs.length} delta="Smart meters, solar, EV" color={C.blue}/>
        <StatCard label="Total Energy" value={`${fmt(totalEnergy,1)} kWh`} delta="Across all energy devices" color={C.green}/>
        <StatCard label="Tariff Rate" value={`₹${rate}/kWh`} delta="Configurable in Settings" color={C.amber}/>
        <StatCard label="Total Bill" value={`₹${fmt(totalBill,0)}`} delta="Fixed + consumption" color={C.purple}/>
      </div>
      <div style={{...cardStyle,padding:0,overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:C.bg}}>{['Device','Type','Location','Energy (kWh)','Fixed (₹)','Bill (₹)'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>
            {energyDevs.map(d=>{const t=TYPES[d.type];const e=d.values.energy||d.values.generated||d.values.sessionEnergy||0;const total=e*rate+fixed;return<tr key={d.id}>
              <td style={tdS}><b style={{fontSize:12}}>{d.name}</b></td>
              <td style={tdS}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 8px',borderRadius:20,fontSize:11}}>{t.icon} {t.label}</span></td>
              <td style={tdS}>{d.location}</td>
              <td style={{...tdS,fontWeight:700}}>{fmt(e,2)}</td>
              <td style={tdS}>₹{fixed}</td>
              <td style={{...tdS,fontWeight:700,color:C.green}}>₹{fmt(total,2)}</td>
            </tr>;})}
          </tbody>
        </table>
      </div>
    </>}
    {tab==='monitoring'&&<div style={{...cardStyle,padding:0,overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:C.bg}}>{['Device','Type','Primary Metric','Min','Max','Uptime','Status'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
        <tbody>
          {devices.slice(0,50).map(d=>{const t=TYPES[d.type];const mn=Math.min(...d.history);const mx=Math.max(...d.history);const alert=hasAlert(d);return<tr key={d.id}>
            <td style={tdS}><b style={{fontSize:12}}>{d.name}</b></td>
            <td style={tdS}><span style={{background:t.bg,color:t.color,fontWeight:700,padding:'3px 8px',borderRadius:20,fontSize:11}}>{t.icon} {t.label}</span></td>
            <td style={{...tdS,fontWeight:600}}>{typeof d.values[t.primary]==='number'?`${fmt(d.values[t.primary],1)} ${t.unit}`:d.values[t.primary]||'—'}</td>
            <td style={tdS}>{fmt(mn,1)}</td>
            <td style={tdS}>{fmt(mx,1)}</td>
            <td style={tdS}>{fmt(d.uptime,1)}%</td>
            <td style={tdS}>{alert?<Pill type="alert">⚠ Alert</Pill>:<Pill type="ok">OK</Pill>}</td>
          </tr>;})}
        </tbody>
      </table>
    </div>}
  </div>;
}

// ══════════════════════════════════════════════════
//  SETTINGS VIEW
// ══════════════════════════════════════════════════
function SettingsView({awsCfg,setAwsCfg,addToast}){
  const [form,setForm]=useState(awsCfg);
  const save=()=>{setAwsCfg(form);addToast('Settings saved');};
  return <div>
    <div style={{marginBottom:16}}><h2 style={{margin:0,fontSize:16,fontWeight:800}}>Settings</h2><p style={{margin:'2px 0 0',fontSize:12,color:C.faint}}>AWS IoT Core & billing configuration</p></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div style={cardStyle}>
        <b>☁ AWS IoT Core Connection</b>
        <p style={{margin:'6px 0 14px',fontSize:12,color:C.faint}}>Connect to your AWS IoT Core endpoint. Devices publish telemetry via MQTT over TLS. Until connected, the dashboard runs simulated live data.</p>
        <Field label="IoT Endpoint"><Input value={form.endpoint} onChange={e=>setForm(f=>({...f,endpoint:e.target.value}))} placeholder="xxxxxxx.iot.ap-south-1.amazonaws.com"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Region"><Input value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))} placeholder="ap-south-1"/></Field>
          <Field label="Port"><Input value={form.port} onChange={e=>setForm(f=>({...f,port:e.target.value}))} placeholder="8883"/></Field>
        </div>
        <Field label="Base Topic"><Input value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} placeholder="devices/+/telemetry"/></Field>
        <Field label="Thing Group Prefix"><Input value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} placeholder="kgp-fleet"/></Field>
        <div style={{display:'flex',gap:8}}>
          <Btn v="primary" onClick={save}>Save & Connect</Btn>
          <Btn v="ghost" onClick={()=>addToast('Running in simulation mode')}>Use Simulation</Btn>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={cardStyle}>
          <b>AWS Architecture</b>
          <div style={{marginTop:14}}>
            <div style={{background:C.bg,borderRadius:10,padding:14,display:'flex',flexDirection:'column',gap:8,fontSize:12}}>
              {[['🏭 IoT Devices (ESP32/Arduino)','MQTT over TLS →'],['☁ AWS IoT Core','Rules Engine →'],['⚡ AWS Lambda','Process + validate →'],['📦 Amazon DynamoDB','Time-series storage →'],['📊 This Dashboard','Real-time visualization']].map(([a,b])=>(
                <div key={a} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{background:'#fff',border:`1px solid ${C.line}`,borderRadius:8,padding:'4px 10px',fontWeight:700,fontSize:11,flex:1}}>{a}</span>
                  <span style={{color:C.faint,fontSize:10,whiteSpace:'nowrap'}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <b>Billing Config</b>
          <Field label="Tariff Rate (₹/kWh)" hint="Applied to energy meters, street lights, solar, EV chargers"><Input type="number" step="0.1" value={form.tariff} onChange={e=>setForm(f=>({...f,tariff:e.target.value}))}/></Field>
          <Field label="Fixed Monthly Charge per Device (₹)"><Input type="number" value={form.fixedCharge} onChange={e=>setForm(f=>({...f,fixedCharge:e.target.value}))}/></Field>
          <Btn v="primary" onClick={save}>Save Config</Btn>
        </div>
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════
//  ADD DEVICE MODAL
// ══════════════════════════════════════════════════
function AddDeviceModal({show,onClose,onAdd}){
  const [form,setForm]=useState({type:'street_light',name:'',location:'',vendor:'',conn:'WiFi',bulk:1});
  const [err,setErr]=useState('');
  const submit=()=>{
    if(!form.name.trim()||!form.location.trim()){setErr('Name and Location are required.');return;}
    const count=Math.max(1,Math.min(100,parseInt(form.bulk)||1));
    const devs=Array.from({length:count},(_,i)=>{
      const t=TYPES[form.type];const fw=mkFW(),lfw=Math.random()>0.4?mkFW():fw;const vals=initV(form.type);const pv=vals[t.primary];
      return{id:'dev_'+(_did++),type:form.type,name:count>1?`${form.name}-${String(i+1).padStart(2,'0')}`:form.name,location:form.location,vendor:form.vendor||(VENDORS[form.type]||['Generic'])[0],conn:form.conn,status:'online',power:'on',mode:'auto',fw,latestFw:lfw,values:vals,history:Array.from({length:24},()=>Math.max(0,(typeof pv==='number'?pv:50)*rnd(0.85,1.15))),uptime:rnd(90,100),dailyEnergy:Array.from({length:14},()=>rnd(0,30))};
    });
    onAdd(devs);onClose();setForm({type:'street_light',name:'',location:'',vendor:'',conn:'WiFi',bulk:1});setErr('');
  };
  return <Modal show={show} onClose={onClose} title="+ Add New Device(s)">
    {err&&<div style={{background:C.redBg,color:C.red,borderRadius:9,padding:'10px 13px',fontSize:13,marginBottom:12}}>{err}</div>}
    <Field label="Device Type *"><Select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{width:'100%'}}>{TK.map(k=><option key={k} value={k}>{TYPES[k].icon} {TYPES[k].label}</option>)}</Select></Field>
    <Field label="Device Name *" hint="For bulk add, a suffix -01, -02… will be appended"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. TANUKU-SMART-DUSTBIN"/></Field>
    <Field label="Location *"><Input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Tanuku"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Vendor"><Input value={form.vendor} onChange={e=>setForm(f=>({...f,vendor:e.target.value}))} placeholder="Auto-filled"/></Field>
      <Field label="Connectivity"><Select value={form.conn} onChange={e=>setForm(f=>({...f,conn:e.target.value}))} style={{width:'100%'}}>{CONNS.map(c=><option key={c}>{c}</option>)}</Select></Field>
    </div>
    <Field label="Bulk Add (1–100)" hint="Add multiple identical devices at once"><Input type="number" min={1} max={100} value={form.bulk} onChange={e=>setForm(f=>({...f,bulk:e.target.value}))}/></Field>
    <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
      <Btn v="ghost" onClick={onClose}>Cancel</Btn>
      <Btn v="primary" onClick={submit}>Add {Math.max(1,parseInt(form.bulk)||1)} Device{parseInt(form.bulk)>1?'s':''}</Btn>
    </div>
  </Modal>;
}

// ══════════════════════════════════════════════════
//  RENAME MODAL
// ══════════════════════════════════════════════════
function RenameModal({device,onClose,onSave}){
  const [name,setName]=useState(device?.name||'');
  useEffect(()=>setName(device?.name||''),[device]);
  return <Modal show={!!device} onClose={onClose} title="✏ Rename Device">
    <Field label="New Device Name"><Input value={name} onChange={e=>setName(e.target.value)} autoFocus onKeyDown={e=>e.key==='Enter'&&onSave(name)}/></Field>
    <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
      <Btn v="ghost" onClick={onClose}>Cancel</Btn>
      <Btn v="primary" onClick={()=>onSave(name)}>Save Name</Btn>
    </div>
  </Modal>;
}

// ══════════════════════════════════════════════════
//  CONTROL MODAL
// ══════════════════════════════════════════════════
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
  return <Modal show={!!device} onClose={onClose} title="⚠ Confirm Control Change">
    {device&&<>
      <div style={{background:C.blueLight,color:C.blueDark,borderRadius:9,padding:'11px 13px',fontSize:13,marginBottom:14}}>Changing <b>{device.name}</b> to <b style={{color:t?.color}}>{mode.toUpperCase()}</b> mode</div>
      {err&&<div style={{background:C.redBg,color:C.red,borderRadius:9,padding:'9px 12px',fontSize:12,marginBottom:12}}>{err}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
        {['auto','on','off'].map(m=><div key={m} onClick={()=>setMode(m)} style={{border:`2px solid ${mode===m?(t?.color||C.blue):C.line}`,borderRadius:10,padding:12,textAlign:'center',cursor:'pointer',background:mode===m?(t?.bg||C.blueLight):'#fff'}}>
          <b style={{fontSize:13,color:mode===m?(t?.color||C.blue):C.ink}}>{m.toUpperCase()}</b>
        </div>)}
      </div>
      <Field label="Your Password *"><Input type="password" value={pass} onChange={e=>setPass(e.target.value)}/></Field>
      <Field label="Reason for Change *" hint="Logged for audit purposes"><Textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Manual override for maintenance"/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
        <Btn v="ghost" onClick={onClose}>Cancel</Btn>
        <Btn v="primary" onClick={confirm}>Verify & Confirm</Btn>
      </div>
    </>}
  </Modal>;
}

// ══════════════════════════════════════════════════
//  SIDEBAR
// ══════════════════════════════════════════════════
const NAV=[{id:'overview',ic:'📡',lbl:'Fleet Overview',badge:'Live'},{id:'devices',ic:'🧩',lbl:'All Devices'},{id:'analytics',ic:'📊',lbl:'Analytics'},{id:'reports',ic:'🧾',lbl:'Reports & Billing'},{id:'ota',ic:'⬆️',lbl:'OTA Updates'},{id:'logs',ic:'🗒️',lbl:'Audit Logs'}];
const NAV2=[{id:'users',ic:'👥',lbl:'Users & Roles'},{id:'settings',ic:'⚙️',lbl:'Settings'}];

function Sidebar({view,setView,currentUser,users}){
  const u=users.find(x=>x.id===currentUser)||users[0]||{};
  const navItem=item=>{const active=view===item.id;return<div key={item.id} onClick={()=>setView(item.id)}
    style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:9,color:active?C.blueDark:C.soft,fontWeight:active?700:500,fontSize:13.5,cursor:'pointer',marginBottom:2,background:active?C.blueLight:'transparent',transition:'background .12s'}}
    onMouseEnter={e=>!active&&(e.currentTarget.style.background=C.bg)}
    onMouseLeave={e=>!active&&(e.currentTarget.style.background='transparent')}>
    <span style={{width:17,textAlign:'center',fontSize:14}}>{item.ic}</span>
    {item.lbl}
    {item.badge&&<span style={{marginLeft:'auto',fontSize:9.5,fontWeight:800,background:C.greenBg,color:C.green,padding:'2px 6px',borderRadius:20}}>{item.badge}</span>}
  </div>;};
  const navLabel=text=><div style={{fontSize:10.5,fontWeight:700,letterSpacing:'.06em',color:C.faint,textTransform:'uppercase',margin:'16px 10px 6px'}}>{text}</div>;
  return <div style={{width:236,background:'#fff',borderRight:`1px solid ${C.line}`,display:'flex',flexDirection:'column',padding:'20px 14px',flexShrink:0,position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
    <div style={{display:'flex',alignItems:'center',gap:9,padding:'4px 8px 22px',fontWeight:800,fontSize:17}}>
      <div style={{width:26,height:26,borderRadius:8,background:'linear-gradient(135deg,#4F6EF7,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14}}>⚡</div>
      KGP Innovation
    </div>
    {navLabel('Unified IoT Console')}
    {NAV.map(navItem)}
    {navLabel('Administration')}
    {NAV2.map(navItem)}
    <div style={{marginTop:'auto',display:'flex',alignItems:'center',gap:9,padding:'14px 8px 0',borderTop:`1px solid ${C.line}`}}>
      <div style={{width:32,height:32,borderRadius:'50%',background:C.blue,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>{(u.name||'A')[0].toUpperCase()}</div>
      <div style={{minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name||'admin'}</div>
        <div style={{fontSize:11,color:C.faint}}>{u.role||'Admin'}</div>
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════
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

  useEffect(()=>{
    tickRef.current=setInterval(()=>{setDevices(prev=>prev.map(tickDev));setCountdown(60);addToast('📡 Fleet data refreshed');},60000);
    cntRef.current=setInterval(()=>setCountdown(c=>Math.max(0,c-1)),1000);
    return()=>{clearInterval(tickRef.current);clearInterval(cntRef.current);};
  },[]);

  const navToDetail=useCallback(id=>{setSelectedId(id);setView('detail');},[]);

  const handleRename=useCallback(newName=>{
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

  return <div style={{display:'flex',minHeight:'100vh',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',background:C.bg,color:C.ink,fontSize:14}}>
    <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-thumb{background:#D6D9E3;border-radius:8px;}::-webkit-scrollbar-track{background:transparent;}`}</style>

    <Sidebar view={view} setView={v=>{setView(v);if(v!=='detail')setSelectedId(null);}} currentUser={currentUser} users={users}/>

    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
      {/* TOPBAR */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 26px',background:'#fff',borderBottom:`1px solid ${C.line}`,position:'sticky',top:0,zIndex:20,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontSize:18,margin:0,fontWeight:800}}>{viewTitles[view]||view}</h1>
          <div style={{fontSize:12,color:C.faint,marginTop:1}}>
            {view==='overview'?`${devices.length.toLocaleString()} devices · ${devices.filter(d=>d.status==='online').length} online · ${devices.filter(hasAlert).length} alerts`:'KGP Innovation — Unified IoT Console'}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,padding:'6px 11px',borderRadius:20,background:'#FFF1E4',color:'#C47300'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#C47300',display:'inline-block'}}/>
            AWS: Simulation
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,padding:'6px 11px',borderRadius:20,background:C.greenBg,color:C.green}}>
            <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:.25;}}`}</style>
            <span style={{width:7,height:7,borderRadius:'50%',background:C.green,display:'inline-block',animation:'blink 1.6s infinite'}}/>
            Refresh in {countdown}s
          </div>
          <Btn v="ghost" onClick={()=>{setDevices(prev=>prev.map(tickDev));setCountdown(60);addToast('📡 Manually refreshed');}}>↻ Now</Btn>
          <select value={currentUser} onChange={e=>setCurrentUser(e.target.value)} style={{...inpStyle,width:'auto',padding:'7px 10px',fontSize:12.5,fontWeight:700}}>
            {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <Btn v="primary" onClick={()=>setShowAdd(true)}>+ Add Device</Btn>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:'22px 26px',flex:1,overflowY:'auto'}}>
        {view==='overview'&&<OverviewView devices={devices} onView={navToDetail} onRename={setRenameDevice} typeFilter={typeFilter} setTypeFilter={setTypeFilter}/>}
        {view==='devices'&&<DevicesView devices={devices} onView={navToDetail} onRename={setRenameDevice} onAdd={()=>setShowAdd(true)} addLog={addLog} addToast={addToast}/>}
        {view==='detail'&&<DetailView d={selectedDevice} onBack={()=>setView('overview')} onRename={setRenameDevice} onControl={handleControl}/>}
        {view==='analytics'&&<AnalyticsView devices={devices}/>}
        {view==='reports'&&<ReportsView devices={devices} awsCfg={awsCfg}/>}
        {view==='ota'&&<OtaView devices={devices} addLog={addLog} addToast={addToast}/>}
        {view==='logs'&&<LogsView logs={logs}/>}
        {view==='users'&&<UsersView users={users} setUsers={setUsers} addToast={addToast}/>}
        {view==='settings'&&<SettingsView awsCfg={awsCfg} setAwsCfg={setAwsCfg} addToast={addToast}/>}
      </div>
    </div>

    <AddDeviceModal show={showAdd} onClose={()=>setShowAdd(false)} onAdd={handleAddDevices}/>
    <RenameModal device={renameDevice} onClose={()=>setRenameDevice(null)} onSave={handleRename}/>
    <ControlModal device={controlDevice} initialMode={controlMode} onClose={()=>setControlDevice(null)} onConfirm={confirmControl} users={users} currentUser={currentUser}/>
    <Toast toasts={toasts}/>
  </div>;
}
