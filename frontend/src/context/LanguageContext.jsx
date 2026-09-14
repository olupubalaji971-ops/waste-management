import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const RAW_TELUGU_MAP = {
  // Navigation & Core branding
  "Autonomous Medical-Waste Network": "స్వయంప్రతిపత్తి మెడికల్-వ్యర్థాల నెట్‌వర్క్",
  "BioWaste Smart": "బయోవేస్ట్ స్మార్ట్",
  "BioWasteSmart": "బయోవేస్ట్ స్మార్ట్",
  "BIOWASTE SMART": "బయోవేస్ట్ స్మార్ట్",
  "BIOWASTE": "బయోవేస్ట్",
  "SMART": "స్మార్ట్",
  "Segregation Guide": "వ్యర్థ విభజన మార్గదర్శి",
  "Segregation Guide AI": "వ్యర్థ విభజన గైడ్ AI",
  "OPEN SEGREGATION ASSISTANT": "వ్యర్థ విభజన సహాయకుడిని తెరవండి",
  "Open Segregation Assistant": "వ్యర్థ విభజన సహాయకుడిని తెరవండి",
  "Instant Item Search Modal": "తక్షణ శోధన విండో",
  "Smart Medical Waste Collection, Segregation & Real-Time Tracking Network": "స్మార్ట్ మెడికల్ వేస్ట్ సేకరణ, విభజన & రియల్-టైమ్ ట్రాకింగ్ నెట్‌వర్క్",
  "Digitally unifies clinical ward generation, fleet collection approvals, dynamic QR custody transfers, and CBMWTF high-temperature autoclaving across Telangana.": "తెలంగాణ వ్యాప్తంగా ఆసుపత్రి వార్డులలో వ్యర్థాల ఉత్పత్తి, సేకరణ ఆమోదాలు, డైనమిక్ QR బదిలీలు మరియు CBMWTF ప్లాంట్లలో శుద్ధి ప్రక్రియను డిజిటల్ పద్ధతిలో అనుసంధానిస్తుంది.",
  "Dark Mode": "డార్క్ మోడ్",
  "Light Mode": "లైట్ మోడ్",
  "Switch to Dark Mode": "డార్క్ మోడ్‌కి మారండి",
  "Switch to Light Mode": "లైట్ మోడ్‌కి మారండి",
  "Switch Facility": "కేంద్రాన్ని మార్చండి",
  "Exit Facility Session": "సెషన్ ముగించండి",
  "Logout to Driver Portal": "డ్రైవర్ పోర్టల్‌కి లాగ్ అవుట్",
  "Logout": "లాగ్ అవుట్",
  "Log Out": "లాగ్ అవుట్",
  "Sign In": "సైన్ ఇన్",
  "Sign Out": "సైన్ అవుట్",
  "Notifications": "నోటిఫికేషన్లు",
  "Unread": "చదవనివి",
  "No notifications yet": "ఇంకా నోటిఫికేషన్లు లేవు",
  "Dashboard": "డ్యాష్‌బోర్డ్",
  "Language": "భాష",

  // Facility Dashboard & Treatment Yards
  "CPCB Authorized CBMWTF": "CPCB అధీకృత CBMWTF",
  "Plant Active": "● ప్లాంట్ సక్రియం",
  "Batches Treated": "చికిత్స చేసిన బ్యాచ్‌లు",
  "Total Weight Treated": "మొత్తం శుద్ధి చేసిన బరువు",
  "100% CPCB Verified Handover": "100% CPCB ధృవీకరించిన అప్పగింత",
  "Daily Capacity: 8,500 kg": "రోజువారీ సామర్థ్యం: 8,500 కేజీలు",
  "High-Temp Incinerators": "హై-టెంప్ ఇన్సినరేటర్లు",
  "1,150°C (3 Active)": "1,150°C (3 సక్రియం)",
  "Continuous Emission Monitoring": "నిరంతర ఉద్గారాల పర్యవేక్షణ",
  "Arrival Geofence": "జీయోఫెన్స్ పరిధి",
  "Haversine GPS Radius Active": "హావర్సిన్ GPS వ్యాసార్థం సక్రియం",
  "Dynamic Gate QR": "డైనమిక్ గేట్ QR",
  "Facility Intake Gate QR": "ప్లాంట్ గేట్ ఇంటేక్ QR",
  "Rotate QR": "QR మార్చండి",
  "Rotate to new secure token": "కొత్త టోకెన్‌తో QR మార్చండి",
  "Scan to verify custody & conclude GPS tracking": "ధృవీకరించడానికి మరియు GPS ముగించడానికి స్కాన్ చేయండి",
  "Simulate Driver Scan (Auto-Refreshes QR)": "డ్రైవర్ స్కాన్ సిమ్యులేట్ చేయండి (ఆటో-రిఫ్రెష్ QR)",
  "Driver Scanning & Refreshing...": "డ్రైవర్ స్కానింగ్ & రిఫ్రెష్ అవుతోంది...",
  "Clicking simulates a carrier driver scanning this gate QR upon reaching the yard": "డ్రైవర్ ప్లాంట్‌కు చేరుకున్నప్పుడు గేట్ QR స్కాన్ చేయడాన్ని ఇది సిమ్యులేట్ చేస్తుంది",
  "Security Token:": "రక్షణ టోకెన్:",
  "Auto-Rotation:": "ఆటో-రిఫ్రెష్:",
  "Auto-refreshes on every driver scan": "ప్రతి డ్రైవర్ స్కాన్‌తో ఆటో-రిఫ్రెష్ అవుతుంది",
  "CPCB Registration:": "CPCB రిజిస్ట్రేషన్:",
  "Real-Time Waste Intake & Custody Log": "నిజ-సమయ వ్యర్థాల స్వీకరణ & కస్టడీ లాగ్",
  "Live record of all biomedical waste batches received and incinerated at this facility.": "ఈ ప్లాంట్‌లో స్వీకరించిన మరియు దహనం చేసిన వ్యర్థాల లైవ్ రికార్డు.",
  "Waiting for First Waste Deposit": "మొదటి వ్యర్థాల డిపాజిట్ కోసం వేచి ఉంది",
  "When a driver transports waste from a hospital and scans this gate QR, the record will instantly appear here with complete driver and batch details.": "డ్రైవర్ ఆసుపత్రి నుండి వ్యర్థాలను రవాణా చేసి గేట్ QR స్కాన్ చేసినప్పుడు వివరాలు ఇక్కడ కనిపిస్తాయి.",
  "Carrier Driver": "రవాణా డ్రైవర్",
  "Origin Hospital": "ఆసుపత్రి",
  "Batch & Category": "బ్యాచ్ & కేటగిరీ",
  "Weight": "బరువు",
  "Status": "స్థితి",
  "Incinerated": "దహనం చేయబడింది",
  "Records": "రికార్డులు",
  "QR Verified": "QR ధృవీకరించబడింది",

  // Driver Console & Portals
  "DRIVER FIELD CONSOLE": "డ్రైవర్ ఫీల్డ్ కన్సోల్",
  "Driver Field Console": "డ్రైవర్ ఫీల్డ్ కన్సోల్",
  "DRIVER FLEET": "డ్రైవర్ ఫ్లీట్",
  "Driver Fleet": "డ్రైవర్ ఫ్లీట్",
  "COLLECTION FLEET": "సేకరణ వాహనాలు",
  "Collection Fleet": "సేకరణ వాహనాలు",
  "ENTER DRIVER PORTAL": "డ్రైవర్ పోర్టల్‌లోకి వెళ్ళండి",
  "Enter Driver Portal": "డ్రైవర్ పోర్టల్‌లోకి వెళ్ళండి",
  "VERIFIED FLEET DRIVER": "ధృవీకరించబడిన ఫ్లీట్ డ్రైవర్",
  "Assigned Destination": "కేటాయించిన గమ్యం",
  "Live GPS Telemetry": "లైవ్ GPS టెలిమెట్రీ",
  "Accept Pickup": "పికప్ అంగీకరించండి",
  "Decline": "తిరస్కరించండి",
  "Scan QR & Verify Bag": "QR స్కాన్ & బ్యాగ్ ధృవీకరణ",
  "Scan Facility Gate QR": "ప్లాంట్ గేట్ QR స్కాన్ చేయండి",
  "Pending Pickups": "పెండింగ్ పికప్‌లు",
  "Active Trip": "ప్రస్తుత ప్రయాణం",
  "Available Hospital Pickup Requests": "అందుబాటులో ఉన్న ఆసుపత్రి పికప్ అభ్యర్థనలు",
  "No pending hospital pickup requests right now.": "ప్రస్తుతం పెండింగ్ పికప్ అభ్యర్థనలు లేవు.",
  "When a hospital creates a waste batch and clicks \"Request Driver\", their pickup request will appear here with Accept / Decline options.": "ఆసుపత్రి వ్యర్థ బ్యాచ్ నమోదు చేసి 'రిక్వెస్ట్ డ్రైవర్' క్లిక్ చేసినప్పుడు ఇక్కడ కనిపిస్తుంది.",
  "Accept Pickup Request": "పికప్ అభ్యర్థనను అంగీకరించండి",
  "Vehicle Number": "వాహనం సంఖ్య",
  "Vehicle:": "వాహనం:",
  "Phone:": "ఫోన్:",
  "Driver Name": "డ్రైవర్ పేరు",
  "Driver Login": "డ్రైవర్ లాగిన్",
  "Driver Registration": "డ్రైవర్ రిజిస్ట్రేషన్",
  "Real-Time Hospital Proximity Sorting": "సమీప ఆసుపత్రుల రియల్-టైమ్ ప్రాధాన్యత",
  "Live Camera Scanner & Barcode Simulator": "లైవ్ కెమెరా స్కానర్ & బార్‌కోడ్ రీడర్",
  "Continuous GPS Telemetry & Custody Log": "నిరంతర GPS ట్రాకింగ్ & భద్రతా లాగ్",
  "Drivers register, sign in, view nearby hospital waste, request collection jobs, and verify loaded biohazard bags with camera barcode scan.": "డ్రైవర్లు లాగిన్ అయి సమీప ఆసుపత్రుల వ్యర్థాలను పరిశీలించి, పికప్ చేసి కెమెరాతో స్కాన్ చేస్తారు.",

  // Hospital Portal & Directory
  "HOSPITAL PORTAL": "హాస్పిటల్ పోర్టల్",
  "Hospital Portal": "హాస్పిటల్ పోర్టల్",
  "ENTER HOSPITAL PORTAL": "హాస్పిటల్ పోర్టల్‌లోకి వెళ్ళండి",
  "Enter Hospital Portal": "హాస్పిటల్ పోర్టల్‌లోకి వెళ్ళండి",
  "12 HOSPITALS": "12 ఆసుపత్రులు",
  "12 Hospitals": "12 ఆసుపత్రులు",
  "Hospital Directory": "ఆసుపత్రుల డైరెక్టరీ",
  "Telangana Verified Healthcare Facilities": "తెలంగాణ ధృవీకరించబడిన ఆరోగ్య కేంద్రాలు",
  "Verified Healthcare Facilities": "ధృవీకరించబడిన ఆరోగ్య కేంద్రాలు",
  "Search hospitals by name, district, or bed capacity...": "ఆసుపత్రి పేరు, జిల్లా లేదా బెడ్ సామర్థ్యం ద్వారా శోధించండి...",
  "Search hospitals...": "ఆసుపత్రులను శోధించండి...",
  "Enter Hospital": "ఆసుపత్రి పోర్టల్‌లోకి వెళ్ళండి",
  "Bed Capacity": "బెడ్ సామర్థ్యం",
  "Number of Beds": "బెడ్స్ సంఖ్య",
  "Beds": "బెడ్స్",
  "District": "జిల్లా",
  "Hospital Administrator": "హాస్పిటల్ అడ్మినిస్ట్రేటర్",
  "Fleet Driver": "ఫ్లీట్ డ్రైవర్",
  "Pollution Control Authority": "కాలుష్య నియంత్రణ మండలి",
  "Super Admin (State)": "రాష్ట్ర సూపర్ అడ్మిన్",
  "Add Waste Batch": "వ్యర్థ బ్యాచ్ నమోదు",
  "Add Waste": "వ్యర్థ బ్యాచ్ నమోదు",
  "Request Pickup": "పికప్ అభ్యర్థన",
  "Log biomedical waste batches, generate versioned dynamic QR codes, request certified drivers, and review incoming collection requests.": "వ్యర్థ బ్యాచ్‌లను నమోదు చేయండి, డైనమిక్ QR కోడ్‌లు సృష్టించండి మరియు డ్రైవర్ పికప్‌లను ట్రాక్ చేయండి.",
  "Dynamic Versioned QR Codes": "డైనమిక్ వెర్షన్డ్ QR కోడ్‌లు",
  "1-Click Driver Dispatch & Approvals": "1-క్లిక్ డ్రైవర్ డిస్పాచ్ & ఆమోదాలు",
  "Gandhi, Osmania, NIMS & 12 Pre-Seeded": "గాంధీ, ఉస్మానియా, నిమ్స్ సహా 12 ఆసుపత్రులు",
  "Government": "ప్రభుత్వ",
  "Private": "ప్రైవేట్",
  "Semi-Autonomous": "సెమీ-అటానమస్",

  // Facility Login, Directory & Plants
  "FACILITIES PORTAL": "ప్రాసెసింగ్ ప్లాంట్ల పోర్టల్",
  "Facilities Portal": "ప్రాసెసింగ్ ప్లాంట్ల పోర్టల్",
  "ENTER FACILITIES PORTAL": "ప్లాంట్ల పోర్టల్‌లోకి వెళ్ళండి",
  "Enter Facilities Portal": "ప్లాంట్ల పోర్టల్‌లోకి వెళ్ళండి",
  "10 CBMWTF PLANTS": "10 CBMWTF ప్లాంట్లు",
  "10 CBMWTF Plants": "10 CBMWTF ప్లాంట్లు",
  "Select Treatment Facility": "ట్రీట్‌మెంట్ కేంద్రాన్ని ఎంచుకోండి",
  "Facility Login": "ప్లాంట్ లాగిన్",
  "Authorized Facility Sign-In & Gate QR": "అధికారిక ప్లాంట్ సైన్-ఇన్ & గేట్ QR",
  "CBMWTF TREATMENT & DISPOSAL DIRECTORY": "CBMWTF వ్యర్థ ప్రాసెసింగ్ డైరెక్టరీ",
  "CPCB BMW RULES 2016 COMPLIANT": "CPCB బయో-మెడికల్ నిబంధనలు 2016 అనుకూలం",
  "Choose any of the 10 authorized Telangana biomedical treatment facilities to access individual gate QR codes, verify arriving collection vehicles, and issue custody transfer receipts.": "వ్యక్తిగత గేట్ QR కోడ్‌లను పొందడానికి, వచ్చే వాహనాలను ధృవీకరించడానికి మరియు రసీదులను ఇవ్వడానికి 10 తెలంగాణ ప్లాంట్లలో ఏదైనా ఎంచుకోండి.",
  "Search facility name, ID, or district...": "ప్లాంట్ పేరు, ID లేదా జిల్లా ద్వారా శోధించండి...",
  "Search facility name, district, or ID...": "ప్లాంట్ పేరు, జిల్లా లేదా ID ద్వారా శోధించండి...",
  "Showing": "చూపిస్తోంది",
  "of": "లో",
  "Registered CBMWTFs": "నమోదైన CBMWTF ప్లాంట్లు",
  "Verified Hospitals": "ధృవీకరించబడిన ఆసుపత్రులు",
  "Password Pattern:": "పాస్‌వర్డ్ నమూనా:",
  "Capacity": "సామర్థ్యం",
  "Equipments": "పరికరాలు",
  "Incin": "ఇన్సిన్",
  "Auto": "ఆటో",
  "kg/day": "కేజీలు/రోజు",
  "Sample Email:": "నమూనా ఇమెయిల్:",
  "Sample Password:": "నమూనా పాస్‌వర్డ్:",
  "Gate QR Token": "గేట్ QR టోకెన్",
  "Auto-Rotates on Driver Scan": "డ్రైవర్ స్కాన్‌తో ఆటో-రిఫ్రెష్",
  "AUTO-ROTATES ON DRIVER SCAN": "డ్రైవర్ స్కాన్‌తో ఆటో-రిఫ్రెష్",
  "LOGIN TO": "లాగిన్:",
  "LOGIN TO RAMKY": "రాంకీ లాగిన్",
  "LOGIN TO MARIDI": "మరిది లాగిన్",
  "LOGIN TO G.J.": "జి.జె. లాగిన్",
  "LOGIN TO MEDICARE": "మెడికేర్ లాగిన్",
  "LOGIN TO CLEAN": "క్లీన్ ఎన్విరో లాగిన్",
  "LOGIN TO APEX": "అపెక్స్ లాగిన్",
  "LOGIN TO DHANVANTHRI": "ధన్వంతరి లాగిన్",
  "LOGIN TO HYDERABAD": "హైదరాబాద్ లాగిన్",
  "LOGIN TO RE": "ఆర్.ఇ. లాగిన్",
  "LOGIN TO NIZAMABAD": "నిజామాబాద్ లాగిన్",
  "District Treatment Center": "జిల్లా చికిత్సా కేంద్రం",
  "Central Treatment Yard": "కేంద్ర ప్రాసెసింగ్ యార్డ్",
  "Dynamic Gate QR Code Generation": "డైనమిక్ గేట్ QR కోడ్ జనరేషన్",
  "Ramky, Maridi, Multiclave, Medicare & 10 Plants": "రాంకీ, మరిది, మల్టీక్లేవ్, మెడికేర్ సహా 10 ప్లాంట్లు",
  "Instant Intake Confirmation & Certificate": "తక్షణ ఇన్సినిరేషన్ రికార్డు & సర్టిఫికేట్",
  "Authorized treatment & disposal companies (Incineration, Autoclave, Effluent Treatment) for final waste destruction confirmation.": "అధికారిక వ్యర్థ ప్రాసెసింగ్ కంపెనీలు (ఇన్సినరేషన్, ఆటోక్లేవ్) వ్యర్థాలను స్వీకరించి తుది ధృవీకరణ చేస్తాయి.",
  "Enter your facility credentials to access the gate intake command dashboard.": "గేట్ ఇంటేక్ కమాండ్ డ్యాష్‌బోర్డ్ కోసం లాగిన్ వివరాలు నమోదు చేయండి.",
  "Email Address": "ఇమెయిల్ చిరునామా",
  "Password": "పాస్‌వర్డ్",
  "Login to Facility": "ప్లాంట్‌లోకి లాగిన్ అవ్వండి",
  "1-Click Demo Login": "1-క్లిక్ డెమో లాగిన్",
  "Click any facility below to automatically authenticate:": "ఆటోమేటిక్ లాగిన్ కోసం ఏదైనా కేంద్రాన్ని క్లిక్ చేయండి:",
  "Back to Home Portal": "← హోమ్ పోర్టల్‌కి తిరిగి వెళ్ళండి",
  "Back to Home": "← హోమ్‌కి తిరిగి వెళ్ళండి",
  "All Districts": "అన్ని జిల్లాలు",
  "All": "అన్నీ",
  "Medchal": "మేడ్చల్",
  "Hyderabad": "హైదరాబాద్",
  "Yadadri Bhuvanagiri": "యాదాద్రి భువనగిరి",
  "Sangareddy": "సంగారెడ్డి",
  "Warangal": "వరంగల్",
  "Karimnagar": "కరీంనగర్",
  "Nizamabad": "నిజామాబాద్",

  // Stats
  "12 Facilities": "12 కేంద్రాలు",
  "Telangana State Network": "తెలంగాణ రాష్ట్ర నెట్‌వర్క్",
  "Digital Waste Tracked": "డిజిటల్ వ్యర్థాల ట్రాకింగ్",
  "End-to-End Custody Logged": "పూర్తి వివరాలు భద్రపరచబడ్డాయి",
  "Dynamic QR Security": "డైనమిక్ QR రక్షణ",
  "Server Token Protected": "సర్వర్ క్రిప్టో టోకెన్ రక్షణ",
  "Operational Mirror": "కార్యాచరణ సమన్వయం",
  "100% Synced": "100% సమన్వయం",

  // BMW Streams & Categories
  "CPCB Bio-Medical Waste Rules 2016": "CPCB బయో-మెడికల్ వేస్ట్ నిబంధనలు 2016",
  "Interactive Color-Coded Segregation Guide": "రంగు-కోడెడ్ వ్యర్థ విభజన గైడ్",
  "Click across the official 5 BMW categories to inspect segregated waste items, required non-chlorinated containers, and authorized disposal protocols.": "విభజించిన వ్యర్థాలు, కంటైనర్లు మరియు అధికారిక డిస్పోజల్ పద్ధతులను తెలుసుకోవడానికి 5 కేటగిరీలపై క్లిక్ చేయండి.",
  "Yellow Stream": "పసుపు విభాగం",
  "Red Stream": "ఎరుపు విభాగం",
  "White Stream": "తెలుపు విభాగం",
  "Blue Stream": "నీలం విభాగం",
  "General Stream": "సాధారణ విభాగం",
  "Infectious / Anatomical": "ఇన్ఫెక్షియస్ / శారీరక",
  "Contaminated Plastics": "ప్లాస్టిక్ వ్యర్థాలు",
  "Sharps & Needles": "సూదులు & పదునైనవి",
  "Glass & Implants": "గాజు & ఇంప్లాంట్లు",
  "Non-Biohazard": "ప్రమాదకరం కానివి",

  // Segregation Assistant / AI Modal
  "Segregation Assistant": "వ్యర్థ విభజన అసిస్టెంట్",
  "CPCB 2016 Classification Engine": "CPCB 2016 వర్గీకరణ ఇంజిన్",
  "Search any medical item (e.g. syringe, blood bag, gloves, scalpel)...": "వైద్య వస్తువును శోధించండి (ఉదా: సిరంజి, రక్తపు బ్యాగ్, గ్లౌజులు)...",
  "Classify": "వర్గీకరించండి",
  "Identify Category": "కేటగిరీని కనుగొనండి",
  "Try examples:": "ఉదాహరణలు:",
  "Prescribed Container": "సూచించిన కంటైనర్ / బ్యాగ్",
  "Treatment Protocol": "చికిత్స & ప్రాసెసింగ్ విధానం",
  "Compliance Rationale & Scientific Basis": "శాస్త్రీయ ప్రాతిపదిక & CPCB నిబంధనలు",
  "Recommended Category": "సిఫార్సు చేయబడిన కేటగిరీ",
  "Use Category": "కేటగిరీని ఉపయోగించండి",
  "Enter any medical waste item to see instant classification": "తక్షణ వర్గీకరణ కోసం ఏదైనా వైద్య వ్యర్థ పదార్థం పేరు నమోదు చేయండి",

  // General App Actions & UI
  "Search": "శోధించండి",
  "Filter": "ఫిల్టర్",
  "Save": "సేవ్ చేయండి",
  "Cancel": "రద్దు చేయండి",
  "Submit": "సమర్పించండి",
  "Confirm": "ధృవీకరించండి",
  "Close": "మూసివేయండి",
  "Yes": "అవును",
  "No": "కాదు",
  "Loading...": "లోడ్ అవుతోంది...",
  "Success": "విజయవంతం",
  "Error": "లోపం",
  "Total": "మొత్తం",
  "Active": "సక్రియం",
  "Inactive": "నిష్క్రియం",
  "Date": "తేదీ",
  "Time": "సమయం",
  "View Details": "వివరాలు చూడండి",
  "Download": "డౌన్‌లోడ్",
  "Print": "ప్రింట్ చేయండి",
  "Generate": "సృష్టించండి",
  "Actions": "చర్యలు",
  "Action": "చర్య",
  "Category": "కేటగిరీ",
  "Batch ID": "బ్యాచ్ ID",
  "Weight (kg)": "బరువు (కేజీలు)",
  "Logged At": "నమోదైన సమయం",
  "Pending": "పెండింగ్‌లో ఉంది",
  "Assigned": "కేటాయించబడింది",
  "Picked Up": "పికప్ చేయబడింది",
  "In Transit": "రవాణాలో ఉంది",
  "Arrived at Facility": "ప్లాంట్‌కు చేరుకుంది",
  "Disposed": "డిస్పోజ్ చేయబడింది",
  "Autoclaved": "ఆటోక్లేవ్ చేయబడింది",
};

// Build an expanded dictionary that automatically supports Exact, UPPERCASE, and lowercase variations
export const TELUGU_MAP = { ...RAW_TELUGU_MAP };
Object.keys(RAW_TELUGU_MAP).forEach((key) => {
  const te = RAW_TELUGU_MAP[key];
  TELUGU_MAP[key.toUpperCase()] = te;
  TELUGU_MAP[key.toLowerCase()] = te;
});

// Sort phrase entries by descending length to prevent partial sub-string collisions
const SORTED_PHRASES = Object.keys(TELUGU_MAP).sort((a, b) => b.length - a.length);

// Build reverse dictionary from Telugu to English
export const REVERSE_TELUGU_MAP = {};
Object.keys(RAW_TELUGU_MAP).forEach((en) => {
  const te = RAW_TELUGU_MAP[en];
  if (te && en) {
    REVERSE_TELUGU_MAP[te] = en;
  }
});
const SORTED_TELUGU_PHRASES = Object.keys(REVERSE_TELUGU_MAP).sort((a, b) => b.length - a.length);

const TELUGU_UNICODE_REGEX = /[\u0C00-\u0C7F]/;

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('bws_language') || 'en';
  });

  const location = useLocation();
  const observerRef = useRef(null);
  const isTranslatingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('bws_language', language);
  }, [language]);

  // Global DOM Text Node & Attribute Translator Engine
  const runTranslation = () => {
    if (isTranslatingRef.current) return;
    isTranslatingRef.current = true;

    try {
      const translateNode = (node) => {
        if (!node) return;

        // Skip non-translatable elements
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toUpperCase();
          if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'CODE'].includes(tagName)) {
            return;
          }
          if (node.hasAttribute('data-no-translate')) {
            return;
          }

          // Handle input & textarea placeholders
          if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
            const ph = node.placeholder;
            if (ph) {
              if (language === 'te') {
                if (!TELUGU_UNICODE_REGEX.test(ph)) {
                  node.__origPlaceholder = ph;
                }
                const clean = ph.trim();
                const target = TELUGU_MAP[clean] || TELUGU_MAP[clean.toUpperCase()] || TELUGU_MAP[clean.toLowerCase()];
                if (target) {
                  node.placeholder = target;
                }
              } else {
                if (node.__origPlaceholder) {
                  node.placeholder = node.__origPlaceholder;
                } else if (REVERSE_TELUGU_MAP[ph.trim()]) {
                  node.placeholder = REVERSE_TELUGU_MAP[ph.trim()];
                }
              }
            }
          }

          // Walk children
          for (let child = node.firstChild; child; child = child.nextSibling) {
            translateNode(child);
          }
          return;
        }

        // Translate text nodes
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;
          if (!text || !text.trim()) return;

          // Preserve sensitive technical tokens (IDs, email addresses, password values)
          const parent = node.parentElement;
          if (parent) {
            if (parent.closest('[data-no-translate]')) return;
            if (parent.classList?.contains('select-all') && (text.includes('@') || text.includes('_TOKEN_'))) {
              return;
            }
          }

          // If text does NOT have Telugu characters, save it as true English baseline
          if (!TELUGU_UNICODE_REGEX.test(text)) {
            node.__origEnglish = text;
          }

          if (language === 'te') {
            let current = text;
            let changed = false;

            // First check if trimmed node exactly matches an entry
            const trimmed = current.trim();
            const directMatch = TELUGU_MAP[trimmed] || TELUGU_MAP[trimmed.toUpperCase()] || TELUGU_MAP[trimmed.toLowerCase()];
            if (directMatch) {
              current = current.replace(trimmed, directMatch);
              changed = true;
            } else {
              // Iterate sorted phrases longest-first
              for (let i = 0; i < SORTED_PHRASES.length; i++) {
                const enPhrase = SORTED_PHRASES[i];
                if (enPhrase.length < 2) continue;

                // Case-insensitive inclusion check
                const idx = current.toLowerCase().indexOf(enPhrase.toLowerCase());
                if (idx !== -1) {
                  const matchedText = current.substring(idx, idx + enPhrase.length);
                  current = current.split(matchedText).join(TELUGU_MAP[enPhrase]);
                  changed = true;
                }
              }
            }

            if (changed && node.nodeValue !== current) {
              node.nodeValue = current;
            }
          } else {
            // Restore English mode cleanly
            if (node.__origEnglish && node.nodeValue !== node.__origEnglish) {
              node.nodeValue = node.__origEnglish;
            } else if (TELUGU_UNICODE_REGEX.test(text)) {
              let current = text;
              let changed = false;

              const trimmed = current.trim();
              if (REVERSE_TELUGU_MAP[trimmed]) {
                current = current.replace(trimmed, REVERSE_TELUGU_MAP[trimmed]);
                changed = true;
              } else {
                for (let i = 0; i < SORTED_TELUGU_PHRASES.length; i++) {
                  const tePhrase = SORTED_TELUGU_PHRASES[i];
                  if (current.includes(tePhrase)) {
                    current = current.split(tePhrase).join(REVERSE_TELUGU_MAP[tePhrase]);
                    changed = true;
                  }
                }
              }

              if (changed && node.nodeValue !== current) {
                node.nodeValue = current;
                node.__origEnglish = current;
              }
            }
          }
        }
      };

      translateNode(document.body);
    } finally {
      isTranslatingRef.current = false;
    }
  };

  // Run on language toggle or route change
  useEffect(() => {
    runTranslation();

    let timeoutId = null;
    observerRef.current = new MutationObserver(() => {
      if (isTranslatingRef.current) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        runTranslation();
      }, 50);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [language, location.pathname]);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'te') {
      setLanguageState(lang);
      localStorage.setItem('bws_language', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const t = (key, fallback) => {
    if (language === 'te') {
      const candidate = fallback || key;
      if (candidate) {
        const clean = candidate.trim();
        if (TELUGU_MAP[clean]) return TELUGU_MAP[clean];
        if (TELUGU_MAP[clean.toUpperCase()]) return TELUGU_MAP[clean.toUpperCase()];
        if (TELUGU_MAP[clean.toLowerCase()]) return TELUGU_MAP[clean.toLowerCase()];
      }
      if (key && TELUGU_MAP[key]) return TELUGU_MAP[key];
      return candidate;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
