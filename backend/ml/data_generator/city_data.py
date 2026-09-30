"""
Multi-City Smart Waste Bins and Fleet Assets
Provides comprehensive, geographically accurate bins (40+ per city) and fleet data for:
  - Bangalore (BBMP)
  - Mumbai (BMC)
  - Delhi (MCD)
  - Chennai (GCC)
  - Kolkata (KMC)
  - Pune (PMC)
  - Ahmedabad (AMC)
"""

# ─────────────────────────────────────────────────────────────
#  BANGALORE BINS (BBMP) — 45 Bins
# ─────────────────────────────────────────────────────────────
BANGALORE_BINS = [
    {"bin_id":"BIN-BLR-01","lat":12.9352,"lon":77.6245,"street":"80 Feet Road, Koramangala 4th Block","area":"Koramangala","ward":"Ward-151","ward_num":151,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-02","lat":12.9380,"lon":77.6210,"street":"100 Feet Inner Ring Road, Koramangala","area":"Koramangala","ward":"Ward-151","ward_num":151,"area_type":"Restaurant","cap":360,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-03","lat":12.9320,"lon":77.6300,"street":"Sony World Signal, Koramangala 6th Block","area":"Koramangala","ward":"Ward-151","ward_num":151,"area_type":"Commercial","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-04","lat":12.9290,"lon":77.6275,"street":"Koramangala Club Road, 5th Block","area":"Koramangala","ward":"Ward-151","ward_num":151,"area_type":"Residential","cap":240,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-05","lat":12.9365,"lon":77.6185,"street":"Forum Mall Road, Koramangala","area":"Koramangala","ward":"Ward-151","ward_num":151,"area_type":"Mall","cap":500,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-06","lat":12.9784,"lon":77.6408,"street":"100 Feet Road, Indiranagar","area":"Indiranagar","ward":"Ward-80","ward_num":80,"area_type":"Commercial","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-07","lat":12.9750,"lon":77.6450,"street":"12th Main Road, Indiranagar","area":"Indiranagar","ward":"Ward-80","ward_num":80,"area_type":"Market","cap":420,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-08","lat":12.9715,"lon":77.6380,"street":"CMH Road Metro Station Gate 2","area":"Indiranagar","ward":"Ward-80","ward_num":80,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-09","lat":12.9805,"lon":77.6480,"street":"Defense Colony Main Road, Indiranagar","area":"Indiranagar","ward":"Ward-80","ward_num":80,"area_type":"Residential","cap":240,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-10","lat":12.9740,"lon":77.6355,"street":"HAL 2nd Stage Park Road","area":"Indiranagar","ward":"Ward-80","ward_num":80,"area_type":"Park","cap":180,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-11","lat":12.9698,"lon":77.7500,"street":"ITPL Main Road, Whitefield","area":"Whitefield","ward":"Ward-84","ward_num":84,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-12","lat":12.9650,"lon":77.7450,"street":"Hope Farm Junction, Whitefield","area":"Whitefield","ward":"Ward-84","ward_num":84,"area_type":"Bus Stand","cap":420,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-13","lat":12.9725,"lon":77.7580,"street":"Prestige Shantiniketan Commercial Gate","area":"Whitefield","ward":"Ward-84","ward_num":84,"area_type":"Commercial","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-14","lat":12.9810,"lon":77.7410,"street":"Kadugodi Metro Station Circle","area":"Whitefield","ward":"Ward-84","ward_num":84,"area_type":"Railway Station","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-15","lat":12.9620,"lon":77.7520,"street":"Varthur Kodi Main Market","area":"Whitefield","ward":"Ward-84","ward_num":84,"area_type":"Market","cap":420,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-16","lat":12.9756,"lon":77.6066,"street":"MG Road Metro Station Entrance","area":"MG Road","ward":"Ward-111","ward_num":111,"area_type":"Commercial","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-17","lat":12.9735,"lon":77.6085,"street":"Brigade Road Cross Junction","area":"MG Road","ward":"Ward-111","ward_num":111,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-18","lat":12.9770,"lon":77.6040,"street":"Church Street Walkway Entrance","area":"MG Road","ward":"Ward-111","ward_num":111,"area_type":"Restaurant","cap":360,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-19","lat":12.9790,"lon":77.6015,"street":"Cubbon Park High Court Gate","area":"MG Road","ward":"Ward-111","ward_num":111,"area_type":"Park","cap":240,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-20","lat":12.9710,"lon":77.6105,"street":"Residency Road Junction","area":"MG Road","ward":"Ward-111","ward_num":111,"area_type":"Commercial","cap":360,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-21","lat":12.8452,"lon":77.6602,"street":"Velankani Tech Park Gate, E-City Phase 1","area":"Electronic City","ward":"Ward-192","ward_num":192,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-22","lat":12.8490,"lon":77.6635,"street":"Infosys Gate 1 Main Road","area":"Electronic City","ward":"Ward-192","ward_num":192,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-23","lat":12.8410,"lon":77.6580,"street":"Wipro Junction, Phase 1","area":"Electronic City","ward":"Ward-192","ward_num":192,"area_type":"Commercial","cap":360,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-24","lat":12.8380,"lon":77.6710,"street":"Phase 2 Toll Plaza Road","area":"Electronic City","ward":"Ward-192","ward_num":192,"area_type":"Industrial","cap":420,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-25","lat":12.8520,"lon":77.6540,"street":"Neeladri Road Market Sector","area":"Electronic City","ward":"Ward-192","ward_num":192,"area_type":"Market","cap":420,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-26","lat":12.9308,"lon":77.5838,"street":"4th Block Complex, Jayanagar","area":"Jayanagar","ward":"Ward-153","ward_num":153,"area_type":"Market","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-27","lat":12.9265,"lon":77.5810,"street":"3rd Block Main Commercial Road","area":"Jayanagar","ward":"Ward-153","ward_num":153,"area_type":"Commercial","cap":360,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-28","lat":12.9340,"lon":77.5875,"street":"South End Circle Metro Pillar 45","area":"Jayanagar","ward":"Ward-153","ward_num":153,"area_type":"Commercial","cap":360,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-29","lat":12.9220,"lon":77.5790,"street":"9th Block Vegetable Market","area":"Jayanagar","ward":"Ward-153","ward_num":153,"area_type":"Market","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-30","lat":12.9385,"lon":77.5855,"street":"Madhavan Park Main Road","area":"Jayanagar","ward":"Ward-153","ward_num":153,"area_type":"Park","cap":240,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-31","lat":12.9121,"lon":77.6446,"street":"27th Main Road, Sector 1, HSR Layout","area":"HSR Layout","ward":"Ward-174","ward_num":174,"area_type":"Commercial","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-32","lat":12.9155,"lon":77.6390,"street":"Sector 2 BDA Complex","area":"HSR Layout","ward":"Ward-174","ward_num":174,"area_type":"Market","cap":420,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-33","lat":12.9090,"lon":77.6485,"street":"Agara Lake View Path","area":"HSR Layout","ward":"Ward-174","ward_num":174,"area_type":"Park","cap":240,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-34","lat":12.9180,"lon":77.6420,"street":"Sector 3 Main Street","area":"HSR Layout","ward":"Ward-174","ward_num":174,"area_type":"Residential","cap":240,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-35","lat":12.9065,"lon":77.6520,"street":"Sector 7 Commercial Junction","area":"HSR Layout","ward":"Ward-174","ward_num":174,"area_type":"Commercial","cap":360,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-36","lat":13.0358,"lon":77.5970,"street":"Hebbal Flyover Bus Stop Junction","area":"Hebbal","ward":"Ward-7","ward_num":7,"area_type":"Bus Stand","cap":420,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-37","lat":13.0410,"lon":77.5925,"street":"Manyata Embassy Business Park Gate 1","area":"Hebbal","ward":"Ward-7","ward_num":7,"area_type":"Commercial","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-38","lat":13.0310,"lon":77.6010,"street":"Hebbal Lake Boating Point","area":"Hebbal","ward":"Ward-7","ward_num":7,"area_type":"Park","cap":180,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-39","lat":13.0450,"lon":77.5880,"street":"Sahakar Nagar Main Road","area":"Hebbal","ward":"Ward-7","ward_num":7,"area_type":"Residential","cap":240,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-40","lat":13.0380,"lon":77.6050,"street":"Outer Ring Road Hebbal Junction","area":"Hebbal","ward":"Ward-7","ward_num":7,"area_type":"Commercial","cap":480,"city":"Bangalore"},

    {"bin_id":"BIN-BLR-41","lat":13.0035,"lon":77.5702,"street":"Sampige Road Market, Malleshwaram","area":"Malleshwaram","ward":"Ward-65","ward_num":65,"area_type":"Market","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-42","lat":13.0080,"lon":77.5680,"street":"Margosa Road 8th Cross","area":"Malleshwaram","ward":"Ward-65","ward_num":65,"area_type":"Commercial","cap":360,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-43","lat":12.9280,"lon":77.6830,"street":"Bellandur EcoSpace Main Road","area":"Bellandur","ward":"Ward-150","ward_num":150,"area_type":"Commercial","cap":500,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-44","lat":12.9560,"lon":77.7010,"street":"Marathahalli Bridge Junction","area":"Marathahalli","ward":"Ward-85","ward_num":85,"area_type":"Bus Stand","cap":480,"city":"Bangalore"},
    {"bin_id":"BIN-BLR-45","lat":12.9100,"lon":77.6850,"street":"Sarjapur Road Wipro Corporate Office","area":"Sarjapur","ward":"Ward-149","ward_num":149,"area_type":"Commercial","cap":480,"city":"Bangalore"},
]


# ─────────────────────────────────────────────────────────────
#  MUMBAI BINS (BMC) — 45 Bins
# ─────────────────────────────────────────────────────────────
MUMBAI_BINS = [
    {"bin_id":"BIN-MUM-01","lat":19.0596,"lon":72.8295,"street":"Hill Road, Bandra West","area":"Bandra","ward":"Ward-H/West","ward_num":8,"area_type":"Commercial","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-02","lat":19.0540,"lon":72.8310,"street":"Linking Road, Bandra West","area":"Bandra","ward":"Ward-H/West","ward_num":8,"area_type":"Market","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-03","lat":19.0480,"lon":72.8220,"street":"Bandstand Promenade Path","area":"Bandra","ward":"Ward-H/West","ward_num":8,"area_type":"Park","cap":240,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-04","lat":19.0625,"lon":72.8360,"street":"Turner Road Junction, Bandra","area":"Bandra","ward":"Ward-H/West","ward_num":8,"area_type":"Restaurant","cap":360,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-05","lat":19.0515,"lon":72.8285,"street":"Mount Mary Basilica Road","area":"Bandra","ward":"Ward-H/West","ward_num":8,"area_type":"Residential","cap":240,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-06","lat":19.0657,"lon":72.8686,"street":"BKC G Block, Avenue 3","area":"BKC","ward":"Ward-H/East","ward_num":9,"area_type":"Commercial","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-07","lat":19.0685,"lon":72.8650,"street":"Jio World Centre Entrance","area":"BKC","ward":"Ward-H/East","ward_num":9,"area_type":"Commercial","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-08","lat":19.0620,"lon":72.8710,"street":"Kalanagar Circle Bus Station","area":"BKC","ward":"Ward-H/East","ward_num":9,"area_type":"Bus Stand","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-09","lat":19.0710,"lon":72.8625,"street":"BKC Diamond Bourse Road","area":"BKC","ward":"Ward-H/East","ward_num":9,"area_type":"Commercial","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-10","lat":19.0640,"lon":72.8740,"street":"Asian Heart Hospital Gate","area":"BKC","ward":"Ward-H/East","ward_num":9,"area_type":"Hospital","cap":480,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-11","lat":19.1136,"lon":72.8697,"street":"Andheri Kurla Road, Chakala","area":"Andheri East","ward":"Ward-K/East","ward_num":11,"area_type":"Commercial","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-12","lat":19.1190,"lon":72.8720,"street":"MIDC Central Road, Andheri East","area":"Andheri East","ward":"Ward-K/East","ward_num":11,"area_type":"Industrial","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-13","lat":19.1170,"lon":72.8620,"street":"Western Express Highway Metro Station","area":"Andheri East","ward":"Ward-K/East","ward_num":11,"area_type":"Railway Station","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-14","lat":19.1240,"lon":72.8660,"street":"Marol Naka Circle","area":"Andheri East","ward":"Ward-K/East","ward_num":11,"area_type":"Market","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-15","lat":19.1090,"lon":72.8750,"street":"Saki Naka Junction Main Road","area":"Andheri East","ward":"Ward-K/East","ward_num":11,"area_type":"Commercial","cap":360,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-16","lat":18.9067,"lon":72.8147,"street":"Colaba Causeway Shopping Street","area":"Colaba","ward":"Ward-A","ward_num":1,"area_type":"Market","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-17","lat":18.9220,"lon":72.8345,"street":"Gateway of India Promenade","area":"Colaba","ward":"Ward-A","ward_num":1,"area_type":"Park","cap":360,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-18","lat":18.9150,"lon":72.8270,"street":"Regal Cinema Circle","area":"Colaba","ward":"Ward-A","ward_num":1,"area_type":"Commercial","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-19","lat":18.9280,"lon":72.8210,"street":"Nariman Point Marine Drive Promenade","area":"Nariman Point","ward":"Ward-A","ward_num":1,"area_type":"Commercial","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-20","lat":18.9320,"lon":72.8250,"street":"Churchgate Railway Station Terminus","area":"Churchgate","ward":"Ward-A","ward_num":1,"area_type":"Railway Station","cap":500,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-21","lat":19.0178,"lon":72.8478,"street":"Dadar TT Circle, Dadar East","area":"Dadar","ward":"Ward-G/North","ward_num":7,"area_type":"Bus Stand","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-22","lat":19.0220,"lon":72.8420,"street":"Dadar Flower Market Central","area":"Dadar","ward":"Ward-G/North","ward_num":7,"area_type":"Market","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-23","lat":19.0260,"lon":72.8390,"street":"Shivaji Park Main Entrance","area":"Dadar","ward":"Ward-G/North","ward_num":7,"area_type":"Park","cap":240,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-24","lat":19.0140,"lon":72.8450,"street":"Dadar Western Railway Station West","area":"Dadar","ward":"Ward-G/North","ward_num":7,"area_type":"Railway Station","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-25","lat":19.0195,"lon":72.8520,"street":"Swami Narayan Temple Road","area":"Dadar","ward":"Ward-G/North","ward_num":7,"area_type":"Residential","cap":240,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-26","lat":19.1176,"lon":72.9060,"street":"IIT Bombay Main Gate Road","area":"Powai","ward":"Ward-S","ward_num":19,"area_type":"School","cap":360,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-27","lat":19.1210,"lon":72.9020,"street":"Hiranandani Gardens Galleria Market","area":"Powai","ward":"Ward-S","ward_num":19,"area_type":"Commercial","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-28","lat":19.1250,"lon":72.8980,"street":"Powai Lake Promenade","area":"Powai","ward":"Ward-S","ward_num":19,"area_type":"Park","cap":240,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-29","lat":19.1150,"lon":72.9110,"street":"JVLR Junction, Powai","area":"Powai","ward":"Ward-S","ward_num":19,"area_type":"Commercial","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-30","lat":19.1195,"lon":72.9145,"street":"Central Avenue, Hiranandani","area":"Powai","ward":"Ward-S","ward_num":19,"area_type":"Residential","cap":240,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-31","lat":19.1075,"lon":72.8263,"street":"Juhu Tara Road, Juhu Beach Gate","area":"Juhu","ward":"Ward-K/West","ward_num":12,"area_type":"Park","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-32","lat":19.1020,"lon":72.8310,"street":"Juhu Circle Bus Station","area":"Juhu","ward":"Ward-K/West","ward_num":12,"area_type":"Bus Stand","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-33","lat":19.1110,"lon":72.8280,"street":"JW Marriott Road, Juhu","area":"Juhu","ward":"Ward-K/West","ward_num":12,"area_type":"Restaurant","cap":360,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-34","lat":19.1050,"lon":72.8350,"street":"Gulmohar Road, Juhu JVPD","area":"Juhu","ward":"Ward-K/West","ward_num":12,"area_type":"Residential","cap":240,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-35","lat":19.1135,"lon":72.8330,"street":"Mithibai College Road","area":"Juhu","ward":"Ward-K/West","ward_num":12,"area_type":"School","cap":360,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-36","lat":19.0060,"lon":72.8310,"street":"Worli Sea Face Promenade","area":"Worli","ward":"Ward-G/South","ward_num":6,"area_type":"Park","cap":300,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-37","lat":18.9980,"lon":72.8250,"street":"Atria Mall Road, Worli","area":"Worli","ward":"Ward-G/South","ward_num":6,"area_type":"Mall","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-38","lat":18.9930,"lon":72.8285,"street":"High Street Phoenix, Lower Parel","area":"Lower Parel","ward":"Ward-G/South","ward_num":6,"area_type":"Mall","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-39","lat":18.9955,"lon":72.8330,"street":"Kamala Mills Compound Entrance","area":"Lower Parel","ward":"Ward-G/South","ward_num":6,"area_type":"Restaurant","cap":420,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-40","lat":19.1350,"lon":72.8350,"street":"Lokhandwala Complex Market","area":"Andheri West","ward":"Ward-K/West","ward_num":12,"area_type":"Market","cap":480,"city":"Mumbai"},

    {"bin_id":"BIN-MUM-41","lat":19.1410,"lon":72.8280,"street":"Infinity Mall Link Road, Andheri West","area":"Andheri West","ward":"Ward-K/West","ward_num":12,"area_type":"Mall","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-42","lat":19.2300,"lon":72.8570,"street":"Borivali Railway Station West","area":"Borivali","ward":"Ward-R/Central","ward_num":24,"area_type":"Railway Station","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-43","lat":19.0860,"lon":72.9080,"street":"R-City Mall, Ghatkopar West","area":"Ghatkopar","ward":"Ward-N","ward_num":15,"area_type":"Mall","cap":500,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-44","lat":19.0700,"lon":72.8800,"street":"Kurla West Market Road","area":"Kurla","ward":"Ward-L","ward_num":14,"area_type":"Market","cap":480,"city":"Mumbai"},
    {"bin_id":"BIN-MUM-45","lat":19.1860,"lon":72.8485,"street":"Inorbit Mall Malad West","area":"Malad","ward":"Ward-P/North","ward_num":16,"area_type":"Mall","cap":500,"city":"Mumbai"},
]


# ─────────────────────────────────────────────────────────────
#  DELHI BINS (MCD) — 45 Bins
# ─────────────────────────────────────────────────────────────
DELHI_BINS = [
    {"bin_id":"BIN-DEL-01","lat":28.6315,"lon":77.2167,"street":"Inner Circle Block A, Connaught Place","area":"Connaught Place","ward":"Ward-CP","ward_num":1,"area_type":"Commercial","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-02","lat":28.6290,"lon":77.2200,"street":"Outer Circle Barakhamba Road","area":"Connaught Place","ward":"Ward-CP","ward_num":1,"area_type":"Commercial","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-03","lat":28.6340,"lon":77.2140,"street":"Palika Bazaar Underground Entrance","area":"Connaught Place","ward":"Ward-CP","ward_num":1,"area_type":"Market","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-04","lat":28.6275,"lon":77.2185,"street":"Janpath Tibetan Market Street","area":"Connaught Place","ward":"Ward-CP","ward_num":1,"area_type":"Market","cap":420,"city":"Delhi"},
    {"bin_id":"BIN-DEL-05","lat":28.6355,"lon":77.2220,"street":"Shivaji Stadium Bus Terminal","area":"Connaught Place","ward":"Ward-CP","ward_num":1,"area_type":"Bus Stand","cap":420,"city":"Delhi"},

    {"bin_id":"BIN-DEL-06","lat":28.5684,"lon":77.2217,"street":"South Extension Part 1 Main Market","area":"South Ext","ward":"Ward-SE","ward_num":2,"area_type":"Market","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-07","lat":28.5660,"lon":77.2250,"street":"South Extension Part 2 Ring Road","area":"South Ext","ward":"Ward-SE","ward_num":2,"area_type":"Commercial","cap":420,"city":"Delhi"},
    {"bin_id":"BIN-DEL-08","lat":28.5710,"lon":77.2190,"street":"AIIMS Hospital Gate 2","area":"South Ext","ward":"Ward-SE","ward_num":2,"area_type":"Hospital","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-09","lat":28.5735,"lon":77.2235,"street":"Safdarjung Hospital OPD Gate","area":"South Ext","ward":"Ward-SE","ward_num":2,"area_type":"Hospital","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-10","lat":28.5640,"lon":77.2280,"street":"Ansal Plaza Khel Gaon Marg","area":"South Ext","ward":"Ward-SE","ward_num":2,"area_type":"Mall","cap":480,"city":"Delhi"},

    {"bin_id":"BIN-DEL-11","lat":28.5921,"lon":77.0460,"street":"Sector 10 Main Market, Dwarka","area":"Dwarka","ward":"Ward-DW","ward_num":3,"area_type":"Market","cap":420,"city":"Delhi"},
    {"bin_id":"BIN-DEL-12","lat":28.5960,"lon":77.0510,"street":"Sector 12 Metro Station Gate 1","area":"Dwarka","ward":"Ward-DW","ward_num":3,"area_type":"Commercial","cap":360,"city":"Delhi"},
    {"bin_id":"BIN-DEL-13","lat":28.5880,"lon":77.0420,"street":"Sector 6 Commercial Complex","area":"Dwarka","ward":"Ward-DW","ward_num":3,"area_type":"Commercial","cap":360,"city":"Delhi"},
    {"bin_id":"BIN-DEL-14","lat":28.6010,"lon":77.0580,"street":"Sector 14 Dwarka Mor Metro","area":"Dwarka","ward":"Ward-DW","ward_num":3,"area_type":"Bus Stand","cap":420,"city":"Delhi"},
    {"bin_id":"BIN-DEL-15","lat":28.5840,"lon":77.0490,"street":"Sector 4 Residential Society Circle","area":"Dwarka","ward":"Ward-DW","ward_num":3,"area_type":"Residential","cap":240,"city":"Delhi"},

    {"bin_id":"BIN-DEL-16","lat":28.7166,"lon":77.1167,"street":"Sector 7 Rohini Ring Road","area":"Rohini","ward":"Ward-RH","ward_num":4,"area_type":"Residential","cap":240,"city":"Delhi"},
    {"bin_id":"BIN-DEL-17","lat":28.7210,"lon":77.1120,"street":"Rohini West Metro Station","area":"Rohini","ward":"Ward-RH","ward_num":4,"area_type":"Commercial","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-18","lat":28.7130,"lon":77.1210,"street":"Sector 8 DDA Market","area":"Rohini","ward":"Ward-RH","ward_num":4,"area_type":"Market","cap":420,"city":"Delhi"},
    {"bin_id":"BIN-DEL-19","lat":28.7250,"lon":77.1080,"street":"Sector 13 Japanese Park Gate","area":"Rohini","ward":"Ward-RH","ward_num":4,"area_type":"Park","cap":240,"city":"Delhi"},
    {"bin_id":"BIN-DEL-20","lat":28.7100,"lon":77.1250,"street":"Sector 3 Ambedkar Hospital Gate","area":"Rohini","ward":"Ward-RH","ward_num":4,"area_type":"Hospital","cap":480,"city":"Delhi"},

    {"bin_id":"BIN-DEL-21","lat":28.6514,"lon":77.1907,"street":"Ajmal Khan Road, Karol Bagh","area":"Karol Bagh","ward":"Ward-KB","ward_num":5,"area_type":"Market","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-22","lat":28.6480,"lon":77.1940,"street":"Gaffar Electronics Market","area":"Karol Bagh","ward":"Ward-KB","ward_num":5,"area_type":"Market","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-23","lat":28.6545,"lon":77.1870,"street":"Karol Bagh Metro Station Gate 2","area":"Karol Bagh","ward":"Ward-KB","ward_num":5,"area_type":"Commercial","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-24","lat":28.6450,"lon":77.1980,"street":"Pusa Road Commercial Hub","area":"Karol Bagh","ward":"Ward-KB","ward_num":5,"area_type":"Commercial","cap":360,"city":"Delhi"},
    {"bin_id":"BIN-DEL-25","lat":28.6570,"lon":77.1830,"street":"Arya Samaj Road Junction","area":"Karol Bagh","ward":"Ward-KB","ward_num":5,"area_type":"Residential","cap":240,"city":"Delhi"},

    {"bin_id":"BIN-DEL-26","lat":28.5494,"lon":77.2001,"street":"Hauz Khas Village Main Lane","area":"Hauz Khas","ward":"Ward-HK","ward_num":6,"area_type":"Restaurant","cap":420,"city":"Delhi"},
    {"bin_id":"BIN-DEL-27","lat":28.5530,"lon":77.2050,"street":"Hauz Khas Metro Station Gate 3","area":"Hauz Khas","ward":"Ward-HK","ward_num":6,"area_type":"Commercial","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-28","lat":28.5460,"lon":77.1950,"street":"Deer Park Jogging Track Entrance","area":"Hauz Khas","ward":"Ward-HK","ward_num":6,"area_type":"Park","cap":240,"city":"Delhi"},
    {"bin_id":"BIN-DEL-29","lat":28.5560,"lon":77.2100,"street":"IIT Delhi Flyover Junction","area":"Hauz Khas","ward":"Ward-HK","ward_num":6,"area_type":"School","cap":360,"city":"Delhi"},
    {"bin_id":"BIN-DEL-30","lat":28.5430,"lon":77.2020,"street":"Aurobindo Marg Market","area":"Hauz Khas","ward":"Ward-HK","ward_num":6,"area_type":"Market","cap":360,"city":"Delhi"},

    {"bin_id":"BIN-DEL-31","lat":28.5244,"lon":77.2105,"street":"Press Enclave Road, Saket District Centre","area":"Saket","ward":"Ward-SK","ward_num":7,"area_type":"Commercial","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-32","lat":28.5280,"lon":77.2140,"street":"Select Citywalk Mall Gate 1","area":"Saket","ward":"Ward-SK","ward_num":7,"area_type":"Mall","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-33","lat":28.5210,"lon":77.2070,"street":"Max Super Speciality Hospital Gate","area":"Saket","ward":"Ward-SK","ward_num":7,"area_type":"Hospital","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-34","lat":28.5310,"lon":77.2180,"street":"Saket Metro Station Terminal","area":"Saket","ward":"Ward-SK","ward_num":7,"area_type":"Commercial","cap":360,"city":"Delhi"},
    {"bin_id":"BIN-DEL-35","lat":28.5180,"lon":77.2040,"street":"J-Block Saket Residential Market","area":"Saket","ward":"Ward-SK","ward_num":7,"area_type":"Residential","cap":240,"city":"Delhi"},

    {"bin_id":"BIN-DEL-36","lat":28.6506,"lon":77.2303,"street":"Chandni Chowk Main Heritage Road","area":"Chandni Chowk","ward":"Ward-CC","ward_num":8,"area_type":"Market","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-37","lat":28.6535,"lon":77.2340,"street":"Red Fort Main Entrance Forecourt","area":"Chandni Chowk","ward":"Ward-CC","ward_num":8,"area_type":"Park","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-38","lat":28.6475,"lon":77.2270,"street":"Fatehpuri Masjid Spice Market Gate","area":"Chandni Chowk","ward":"Ward-CC","ward_num":8,"area_type":"Market","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-39","lat":28.6550,"lon":77.2240,"street":"Old Delhi Railway Station Circle","area":"Chandni Chowk","ward":"Ward-CC","ward_num":8,"area_type":"Railway Station","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-40","lat":28.6450,"lon":77.2330,"street":"Dariba Kalan Jewelry Lane","area":"Chandni Chowk","ward":"Ward-CC","ward_num":8,"area_type":"Market","cap":420,"city":"Delhi"},

    {"bin_id":"BIN-DEL-41","lat":28.5670,"lon":77.2430,"street":"Central Market, Lajpat Nagar 2","area":"Lajpat Nagar","ward":"Ward-LN","ward_num":9,"area_type":"Market","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-42","lat":28.5470,"lon":77.2530,"street":"Nehru Place IT Market Outer Ring Road","area":"Nehru Place","ward":"Ward-NP","ward_num":10,"area_type":"Commercial","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-43","lat":28.5400,"lon":77.1550,"street":"Ambience Mall, Vasant Kunj","area":"Vasant Kunj","ward":"Ward-VK","ward_num":11,"area_type":"Mall","cap":500,"city":"Delhi"},
    {"bin_id":"BIN-DEL-44","lat":28.6980,"lon":77.1400,"street":"Netaji Subhash Place Commercial Tower","area":"Pitampura","ward":"Ward-PT","ward_num":12,"area_type":"Commercial","cap":480,"city":"Delhi"},
    {"bin_id":"BIN-DEL-45","lat":28.5280,"lon":77.2800,"street":"Okhla Industrial Area Phase 2","area":"Okhla","ward":"Ward-OK","ward_num":13,"area_type":"Industrial","cap":420,"city":"Delhi"},
]


# ─────────────────────────────────────────────────────────────
#  CHENNAI BINS (GCC) — 42 Bins
# ─────────────────────────────────────────────────────────────
CHENNAI_BINS = [
    {"bin_id":"BIN-MAA-01","lat":13.0418,"lon":80.2341,"street":"Usman Road Commercial Hub, T. Nagar","area":"T. Nagar","ward":"Ward-133","ward_num":133,"area_type":"Market","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-02","lat":13.0380,"lon":80.2310,"street":"Ranganathan Street Pedestrian Zone","area":"T. Nagar","ward":"Ward-133","ward_num":133,"area_type":"Market","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-03","lat":13.0450,"lon":80.2370,"street":"Panagal Park Promenade","area":"T. Nagar","ward":"Ward-133","ward_num":133,"area_type":"Park","cap":240,"city":"Chennai"},
    {"bin_id":"BIN-MAA-04","lat":13.0350,"lon":80.2280,"street":"Mambalam Railway Station East Gate","area":"T. Nagar","ward":"Ward-133","ward_num":133,"area_type":"Railway Station","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-05","lat":13.0480,"lon":80.2320,"street":"G.N. Chetty Road Commercial Lane","area":"T. Nagar","ward":"Ward-133","ward_num":133,"area_type":"Commercial","cap":360,"city":"Chennai"},

    {"bin_id":"BIN-MAA-06","lat":13.0012,"lon":80.2565,"street":"LB Road, Adyar Junction","area":"Adyar","ward":"Ward-173","ward_num":173,"area_type":"Residential","cap":240,"city":"Chennai"},
    {"bin_id":"BIN-MAA-07","lat":12.9970,"lon":80.2590,"street":"Besant Avenue Road, Theosophical Society","area":"Adyar","ward":"Ward-173","ward_num":173,"area_type":"Park","cap":240,"city":"Chennai"},
    {"bin_id":"BIN-MAA-08","lat":13.0050,"lon":80.2520,"street":"Sardar Patel Road, Adyar Gate","area":"Adyar","ward":"Ward-173","ward_num":173,"area_type":"Commercial","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-09","lat":12.9930,"lon":80.2630,"street":"Elliot's Beach Promenade, Besant Nagar","area":"Adyar","ward":"Ward-173","ward_num":173,"area_type":"Park","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-10","lat":13.0090,"lon":80.2480,"street":"Kasturibai Nagar Main Road","area":"Adyar","ward":"Ward-173","ward_num":173,"area_type":"Residential","cap":240,"city":"Chennai"},

    {"bin_id":"BIN-MAA-11","lat":12.9815,"lon":80.2180,"street":"Velachery Main Road Market Complex","area":"Velachery","ward":"Ward-178","ward_num":178,"area_type":"Market","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-12","lat":12.9770,"lon":80.2220,"street":"Phoenix MarketCity South Gate","area":"Velachery","ward":"Ward-178","ward_num":178,"area_type":"Mall","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-13","lat":12.9850,"lon":80.2130,"street":"Velachery MRTS Railway Station","area":"Velachery","ward":"Ward-178","ward_num":178,"area_type":"Railway Station","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-14","lat":12.9720,"lon":80.2250,"street":"100 Feet Bypass Road, Velachery","area":"Velachery","ward":"Ward-178","ward_num":178,"area_type":"Commercial","cap":360,"city":"Chennai"},
    {"bin_id":"BIN-MAA-15","lat":12.9890,"lon":80.2100,"street":"Vijaya Nagar Bus Terminus","area":"Velachery","ward":"Ward-178","ward_num":178,"area_type":"Bus Stand","cap":420,"city":"Chennai"},

    {"bin_id":"BIN-MAA-16","lat":13.0878,"lon":80.2117,"street":"2nd Avenue, Anna Nagar Roundtana","area":"Anna Nagar","ward":"Ward-102","ward_num":102,"area_type":"Commercial","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-17","lat":13.0840,"lon":80.2160,"street":"Anna Nagar Tower Park Gate 1","area":"Anna Nagar","ward":"Ward-102","ward_num":102,"area_type":"Park","cap":240,"city":"Chennai"},
    {"bin_id":"BIN-MAA-18","lat":13.0920,"lon":80.2070,"street":"Anna Nagar West Bus Depot","area":"Anna Nagar","ward":"Ward-102","ward_num":102,"area_type":"Bus Stand","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-19","lat":13.0810,"lon":80.2190,"street":"Shanti Colony Commercial Lane","area":"Anna Nagar","ward":"Ward-102","ward_num":102,"area_type":"Restaurant","cap":360,"city":"Chennai"},
    {"bin_id":"BIN-MAA-20","lat":13.0950,"lon":80.2030,"street":"Thirumangalam Metro Station Junction","area":"Anna Nagar","ward":"Ward-102","ward_num":102,"area_type":"Commercial","cap":480,"city":"Chennai"},

    {"bin_id":"BIN-MAA-21","lat":13.0330,"lon":80.2680,"street":"Kapaleeshwarar Temple North Mada St","area":"Mylapore","ward":"Ward-124","ward_num":124,"area_type":"Market","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-22","lat":13.0370,"lon":80.2640,"street":"Luz Church Road Circle","area":"Mylapore","ward":"Ward-124","ward_num":124,"area_type":"Commercial","cap":360,"city":"Chennai"},
    {"bin_id":"BIN-MAA-23","lat":13.0290,"lon":80.2720,"street":"San Thome High Road Bus Stop","area":"Mylapore","ward":"Ward-124","ward_num":124,"area_type":"Bus Stand","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-24","lat":13.0410,"lon":80.2610,"street":"Kutchery Road Market","area":"Mylapore","ward":"Ward-124","ward_num":124,"area_type":"Market","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-25","lat":13.0260,"lon":80.2750,"street":"Marina Beach Kamarajar Salai Path","area":"Mylapore","ward":"Ward-124","ward_num":124,"area_type":"Park","cap":480,"city":"Chennai"},

    {"bin_id":"BIN-MAA-26","lat":13.0070,"lon":80.2120,"street":"Guindy Industrial Estate 1st Main Rd","area":"Guindy","ward":"Ward-160","ward_num":160,"area_type":"Industrial","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-27","lat":13.0120,"lon":80.2150,"street":"Guindy Railway & Metro Station","area":"Guindy","ward":"Ward-160","ward_num":160,"area_type":"Railway Station","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-28","lat":13.0020,"lon":80.2210,"street":"IIT Madras Main Gate Anna Salai","area":"Guindy","ward":"Ward-160","ward_num":160,"area_type":"School","cap":360,"city":"Chennai"},
    {"bin_id":"BIN-MAA-29","lat":13.0160,"lon":80.2080,"street":"Kathipara Junction Grade Separator","area":"Guindy","ward":"Ward-160","ward_num":160,"area_type":"Commercial","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-30","lat":12.9980,"lon":80.2260,"street":"Guindy National Park Children Gate","area":"Guindy","ward":"Ward-160","ward_num":160,"area_type":"Park","cap":240,"city":"Chennai"},

    {"bin_id":"BIN-MAA-31","lat":13.0580,"lon":80.2430,"street":"Nungambakkam High Road Commerce Hub","area":"Nungambakkam","ward":"Ward-110","ward_num":110,"area_type":"Commercial","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-32","lat":13.0620,"lon":80.2390,"street":"Loyola College Road Gate","area":"Nungambakkam","ward":"Ward-110","ward_num":110,"area_type":"School","cap":360,"city":"Chennai"},
    {"bin_id":"BIN-MAA-33","lat":13.0540,"lon":80.2470,"street":"Valluvar Kottam High Road","area":"Nungambakkam","ward":"Ward-110","ward_num":110,"area_type":"Park","cap":240,"city":"Chennai"},
    {"bin_id":"BIN-MAA-34","lat":13.0650,"lon":80.2350,"street":"Sterling Road Residential Lane","area":"Nungambakkam","ward":"Ward-110","ward_num":110,"area_type":"Residential","cap":240,"city":"Chennai"},
    {"bin_id":"BIN-MAA-35","lat":13.0510,"lon":80.2510,"street":"Tirumurthy Nagar Market","area":"Nungambakkam","ward":"Ward-110","ward_num":110,"area_type":"Market","cap":420,"city":"Chennai"},

    {"bin_id":"BIN-MAA-36","lat":12.9250,"lon":80.1200,"street":"Tambaram Railway Station West Bus Stand","area":"Tambaram","ward":"Ward-TAM","ward_num":185,"area_type":"Railway Station","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-37","lat":12.9320,"lon":80.1250,"street":"GST Road Tambaram Sanatorium","area":"Tambaram","ward":"Ward-TAM","ward_num":185,"area_type":"Commercial","cap":420,"city":"Chennai"},
    {"bin_id":"BIN-MAA-38","lat":12.9450,"lon":80.2350,"street":"OMR Thoraipakkam Toll Plaza Hub","area":"OMR","ward":"Ward-OMR","ward_num":190,"area_type":"Commercial","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-39","lat":12.9100,"lon":80.2280,"street":"Sholinganallur ELCOT SEZ Entrance","area":"OMR","ward":"Ward-OMR","ward_num":190,"area_type":"Commercial","cap":480,"city":"Chennai"},
    {"bin_id":"BIN-MAA-40","lat":13.0350,"lon":80.1550,"street":"Porur Roundtana Market","area":"Porur","ward":"Ward-POR","ward_num":152,"area_type":"Market","cap":480,"city":"Chennai"},

    {"bin_id":"BIN-MAA-41","lat":13.0780,"lon":80.2600,"street":"Egmore Railway Station North Gate","area":"Egmore","ward":"Ward-EGM","ward_num":105,"area_type":"Railway Station","cap":500,"city":"Chennai"},
    {"bin_id":"BIN-MAA-42","lat":13.0720,"lon":80.2650,"street":"Government Museum Pantheon Road","area":"Egmore","ward":"Ward-EGM","ward_num":105,"area_type":"Park","cap":240,"city":"Chennai"},
]


# ─────────────────────────────────────────────────────────────
#  KOLKATA BINS (KMC) — 42 Bins
# ─────────────────────────────────────────────────────────────
KOLKATA_BINS = [
    {"bin_id":"BIN-CCU-01","lat":22.5539,"lon":88.3518,"street":"Park Street Crossing Commercial Hub","area":"Park Street","ward":"Ward-63","ward_num":63,"area_type":"Commercial","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-02","lat":22.5500,"lon":88.3550,"street":"Camac Street Shopping Mall Entrance","area":"Park Street","ward":"Ward-63","ward_num":63,"area_type":"Mall","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-03","lat":22.5570,"lon":88.3480,"street":"Park Street Metro Station Gate 1","area":"Park Street","ward":"Ward-63","ward_num":63,"area_type":"Commercial","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-04","lat":22.5470,"lon":88.3580,"street":"Russell Street Restaurant Lane","area":"Park Street","ward":"Ward-63","ward_num":63,"area_type":"Restaurant","cap":360,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-05","lat":22.5600,"lon":88.3450,"street":"Middleton Row Residential Corner","area":"Park Street","ward":"Ward-63","ward_num":63,"area_type":"Residential","cap":240,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-06","lat":22.5867,"lon":88.4171,"street":"City Centre 1 Mall, Salt Lake","area":"Salt Lake","ward":"Ward-31","ward_num":31,"area_type":"Mall","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-07","lat":22.5720,"lon":88.4320,"street":"Sector V Wipro More Tech Hub","area":"Salt Lake","ward":"Ward-31","ward_num":31,"area_type":"Commercial","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-08","lat":22.5760,"lon":88.4280,"street":"College More, Sector V","area":"Salt Lake","ward":"Ward-31","ward_num":31,"area_type":"School","cap":360,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-09","lat":22.5820,"lon":88.4220,"street":"Karunamoyee Bus Terminus","area":"Salt Lake","ward":"Ward-31","ward_num":31,"area_type":"Bus Stand","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-10","lat":22.5900,"lon":88.4120,"street":"Central Park Salt Lake Lakefront","area":"Salt Lake","ward":"Ward-31","ward_num":31,"area_type":"Park","cap":240,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-11","lat":22.5958,"lon":88.4716,"street":"Action Area 1 Eco Park Main Gate","area":"New Town","ward":"Ward-12","ward_num":12,"area_type":"Park","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-12","lat":22.5910,"lon":88.4760,"street":"City Centre 2 Mall, New Town","area":"New Town","ward":"Ward-12","ward_num":12,"area_type":"Mall","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-13","lat":22.5850,"lon":88.4680,"street":"New Town Bus Stand Hub","area":"New Town","ward":"Ward-12","ward_num":12,"area_type":"Bus Stand","cap":420,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-14","lat":22.6000,"lon":88.4800,"street":"Action Area 2 DLF IT Park","area":"New Town","ward":"Ward-12","ward_num":12,"area_type":"Commercial","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-15","lat":22.5800,"lon":88.4630,"street":"Chinar Park Crossing Market","area":"New Town","ward":"Ward-12","ward_num":12,"area_type":"Market","cap":420,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-16","lat":22.5690,"lon":88.3510,"street":"Esplanade Tram & Bus Depot","area":"Esplanade","ward":"Ward-45","ward_num":45,"area_type":"Bus Stand","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-17","lat":22.5650,"lon":88.3550,"street":"New Market Lindsay Street Gate","area":"Esplanade","ward":"Ward-45","ward_num":45,"area_type":"Market","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-18","lat":22.5730,"lon":88.3470,"street":"Chandni Chowk Electronics Lane","area":"Esplanade","ward":"Ward-45","ward_num":45,"area_type":"Market","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-19","lat":22.5620,"lon":88.3590,"street":"Chowringhee Road Metro Entrance","area":"Esplanade","ward":"Ward-45","ward_num":45,"area_type":"Commercial","cap":420,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-20","lat":22.5770,"lon":88.3430,"street":"BBD Bagh Writers Building Square","area":"Esplanade","ward":"Ward-45","ward_num":45,"area_type":"Commercial","cap":360,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-21","lat":22.5830,"lon":88.3420,"street":"Howrah Railway Station Terminal 1","area":"Howrah","ward":"Ward-HWH","ward_num":50,"area_type":"Railway Station","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-22","lat":22.5880,"lon":88.3370,"street":"Howrah Bridge Approach Road","area":"Howrah","ward":"Ward-HWH","ward_num":50,"area_type":"Commercial","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-23","lat":22.5790,"lon":88.3450,"street":"Howrah Ferry Ghat Entrance","area":"Howrah","ward":"Ward-HWH","ward_num":50,"area_type":"Bus Stand","cap":420,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-24","lat":22.5920,"lon":88.3320,"street":"Golabari Wholesale Market","area":"Howrah","ward":"Ward-HWH","ward_num":50,"area_type":"Market","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-25","lat":22.5750,"lon":88.3490,"street":"Foreshore Road Industrial Hub","area":"Howrah","ward":"Ward-HWH","ward_num":50,"area_type":"Industrial","cap":360,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-26","lat":22.5280,"lon":88.3650,"street":"Gariahat Market Crossing Circle","area":"Ballygunge","ward":"Ward-85","ward_num":85,"area_type":"Market","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-27","lat":22.5230,"lon":88.3690,"street":"Golpark Lake Gardens Walkway","area":"Ballygunge","ward":"Ward-85","ward_num":85,"area_type":"Park","cap":240,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-28","lat":22.5330,"lon":88.3600,"street":"Ballygunge Circular Road Society","area":"Ballygunge","ward":"Ward-85","ward_num":85,"area_type":"Residential","cap":240,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-29","lat":22.5180,"lon":88.3730,"street":"Dhakuria Railway Station Market","area":"Ballygunge","ward":"Ward-85","ward_num":85,"area_type":"Market","cap":420,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-30","lat":22.5380,"lon":88.3560,"street":"Hazra Road Commercial Crossing","area":"Ballygunge","ward":"Ward-85","ward_num":85,"area_type":"Commercial","cap":360,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-31","lat":22.5350,"lon":88.3310,"street":"Alipore Zoological Gardens Gate","area":"Alipore","ward":"Ward-74","ward_num":74,"area_type":"Park","cap":360,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-32","lat":22.5300,"lon":88.3260,"street":"National Library Belvedre Road","area":"Alipore","ward":"Ward-74","ward_num":74,"area_type":"School","cap":240,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-33","lat":22.5400,"lon":88.3350,"street":"SSKM Hospital Emergency Gate","area":"Alipore","ward":"Ward-74","ward_num":74,"area_type":"Hospital","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-34","lat":22.5250,"lon":88.3210,"street":"Majerhat Railway Station Square","area":"Alipore","ward":"Ward-74","ward_num":74,"area_type":"Railway Station","cap":420,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-35","lat":22.5450,"lon":88.3400,"street":"Rabindra Sadan Cultural Complex","area":"Alipore","ward":"Ward-74","ward_num":74,"area_type":"Commercial","cap":360,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-36","lat":22.6200,"lon":88.3950,"street":"Dum Dum Metro Station Forecourt","area":"Dum Dum","ward":"Ward-DD","ward_num":1,"area_type":"Railway Station","cap":500,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-37","lat":22.6350,"lon":88.4200,"street":"Jessore Road Airport Gate 1","area":"Dum Dum","ward":"Ward-DD","ward_num":1,"area_type":"Commercial","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-38","lat":22.6010,"lon":88.3710,"street":"Shyambazar Five Point Crossing","area":"Shyambazar","ward":"Ward-10","ward_num":10,"area_type":"Market","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-39","lat":22.4980,"lon":88.3150,"street":"Behala Chowrasta Market Diamond Harbour Rd","area":"Behala","ward":"Ward-120","ward_num":120,"area_type":"Market","cap":480,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-40","lat":22.4950,"lon":88.3700,"street":"Jadavpur University 8B Bus Stand","area":"Jadavpur","ward":"Ward-96","ward_num":96,"area_type":"School","cap":420,"city":"Kolkata"},

    {"bin_id":"BIN-CCU-41","lat":22.5980,"lon":88.4050,"street":"Lake Town VIP Road Crossing","area":"Lake Town","ward":"Ward-LT","ward_num":22,"area_type":"Commercial","cap":420,"city":"Kolkata"},
    {"bin_id":"BIN-CCU-42","lat":22.5020,"lon":88.3980,"street":"Ruby Hospital EM Bypass Crossing","area":"EM Bypass","ward":"Ward-EMB","ward_num":107,"area_type":"Hospital","cap":500,"city":"Kolkata"},
]


# ─────────────────────────────────────────────────────────────
#  PUNE BINS (PMC) — 42 Bins
# ─────────────────────────────────────────────────────────────
PUNE_BINS = [
    {"bin_id":"BIN-PNQ-01","lat":18.5074,"lon":73.8077,"street":"Karve Road, Kothrud Stand","area":"Kothrud","ward":"Ward-28","ward_num":28,"area_type":"Residential","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-02","lat":18.5030,"lon":73.8110,"street":"Paud Road Vanaz Metro Station","area":"Kothrud","ward":"Ward-28","ward_num":28,"area_type":"Commercial","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-03","lat":18.5110,"lon":73.8040,"street":"MIT College Road Campus Gate","area":"Kothrud","ward":"Ward-28","ward_num":28,"area_type":"School","cap":360,"city":"Pune"},
    {"bin_id":"BIN-PNQ-04","lat":18.4990,"lon":73.8150,"street":"Chandani Chowk Bypass Junction","area":"Kothrud","ward":"Ward-28","ward_num":28,"area_type":"Bus Stand","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-05","lat":18.5150,"lon":73.8010,"street":"Ideal Colony Joggers Park","area":"Kothrud","ward":"Ward-28","ward_num":28,"area_type":"Park","cap":180,"city":"Pune"},

    {"bin_id":"BIN-PNQ-06","lat":18.5679,"lon":73.9143,"street":"Viman Nagar Main Road, Phoenix Marketcity","area":"Viman Nagar","ward":"Ward-5","ward_num":5,"area_type":"Mall","cap":500,"city":"Pune"},
    {"bin_id":"BIN-PNQ-07","lat":18.5630,"lon":73.9180,"street":"Datta Mandir Chowk, Viman Nagar","area":"Viman Nagar","ward":"Ward-5","ward_num":5,"area_type":"Market","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-08","lat":18.5720,"lon":73.9100,"street":"Symbiosis College Campus Gate","area":"Viman Nagar","ward":"Ward-5","ward_num":5,"area_type":"School","cap":360,"city":"Pune"},
    {"bin_id":"BIN-PNQ-09","lat":18.5590,"lon":73.9220,"street":"Pune Airport Road Junction","area":"Viman Nagar","ward":"Ward-5","ward_num":5,"area_type":"Commercial","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-10","lat":18.5760,"lon":73.9060,"street":"Joggers Park Viman Nagar","area":"Viman Nagar","ward":"Ward-5","ward_num":5,"area_type":"Park","cap":240,"city":"Pune"},

    {"bin_id":"BIN-PNQ-11","lat":18.5912,"lon":73.7389,"street":"Phase 1, Hinjewadi Rajiv Gandhi Infotech Park","area":"Hinjewadi","ward":"Ward-1","ward_num":1,"area_type":"Commercial","cap":500,"city":"Pune"},
    {"bin_id":"BIN-PNQ-12","lat":18.5950,"lon":73.7340,"street":"Infosys Phase 1 Main Circle","area":"Hinjewadi","ward":"Ward-1","ward_num":1,"area_type":"Commercial","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-13","lat":18.5870,"lon":73.7430,"street":"Hinjewadi Chowk Bus Terminal","area":"Hinjewadi","ward":"Ward-1","ward_num":1,"area_type":"Bus Stand","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-14","lat":18.6010,"lon":73.7280,"street":"Phase 2 Wipro Circle","area":"Hinjewadi","ward":"Ward-1","ward_num":1,"area_type":"Commercial","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-15","lat":18.6080,"lon":73.7210,"street":"Phase 3 Tech Mahindra Campus","area":"Hinjewadi","ward":"Ward-1","ward_num":1,"area_type":"Commercial","cap":360,"city":"Pune"},

    {"bin_id":"BIN-PNQ-16","lat":18.5310,"lon":73.8470,"street":"FC Road Starbucks Corner, Shivaji Nagar","area":"Shivaji Nagar","ward":"Ward-14","ward_num":14,"area_type":"Restaurant","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-17","lat":18.5360,"lon":73.8430,"street":"Fergusson College Main Gate","area":"Shivaji Nagar","ward":"Ward-14","ward_num":14,"area_type":"School","cap":360,"city":"Pune"},
    {"bin_id":"BIN-PNQ-18","lat":18.5270,"lon":73.8510,"street":"JM Road Sambhaji Park Gate","area":"Shivaji Nagar","ward":"Ward-14","ward_num":14,"area_type":"Park","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-19","lat":18.5410,"lon":73.8390,"street":"Shivaji Nagar Railway Station North","area":"Shivaji Nagar","ward":"Ward-14","ward_num":14,"area_type":"Railway Station","cap":500,"city":"Pune"},
    {"bin_id":"BIN-PNQ-20","lat":18.5230,"lon":73.8550,"street":"Modern College Chowk Market","area":"Shivaji Nagar","ward":"Ward-14","ward_num":14,"area_type":"Market","cap":420,"city":"Pune"},

    {"bin_id":"BIN-PNQ-21","lat":18.5580,"lon":73.7920,"street":"Baner Road D-Mart Complex","area":"Baner","ward":"Ward-9","ward_num":9,"area_type":"Market","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-22","lat":18.5530,"lon":73.7960,"street":"High Street Baner Restaurant Row","area":"Baner","ward":"Ward-9","ward_num":9,"area_type":"Restaurant","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-23","lat":18.5630,"lon":73.7880,"street":"Pashan Sus Road Junction","area":"Baner","ward":"Ward-9","ward_num":9,"area_type":"Residential","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-24","lat":18.5690,"lon":73.7830,"street":"Balewadi High Street Entrance","area":"Baner","ward":"Ward-9","ward_num":9,"area_type":"Commercial","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-25","lat":18.5750,"lon":73.7780,"street":"Balewadi Stadium Sports Gate","area":"Baner","ward":"Ward-9","ward_num":9,"area_type":"Park","cap":300,"city":"Pune"},

    {"bin_id":"BIN-PNQ-26","lat":18.5980,"lon":73.7650,"street":"Wakad Bridge Hinjewadi Link Road","area":"Wakad","ward":"Ward-2","ward_num":2,"area_type":"Commercial","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-27","lat":18.6030,"lon":73.7600,"street":"Dange Chowk Market Hub","area":"Wakad","ward":"Ward-2","ward_num":2,"area_type":"Market","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-28","lat":18.5930,"lon":73.7700,"street":"Kaspate Vasti Main Road","area":"Wakad","ward":"Ward-2","ward_num":2,"area_type":"Residential","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-29","lat":18.6080,"lon":73.7550,"street":"Datta Mandir Road Wakad","area":"Wakad","ward":"Ward-2","ward_num":2,"area_type":"Residential","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-30","lat":18.5880,"lon":73.7750,"street":"Bhumkar Chowk Highway Stop","area":"Wakad","ward":"Ward-2","ward_num":2,"area_type":"Bus Stand","cap":420,"city":"Pune"},

    {"bin_id":"BIN-PNQ-31","lat":18.5080,"lon":73.9310,"street":"Magarpatta City Destination Centre","area":"Hadapsar","ward":"Ward-20","ward_num":20,"area_type":"Commercial","cap":500,"city":"Pune"},
    {"bin_id":"BIN-PNQ-32","lat":18.5130,"lon":73.9260,"street":"Cybercity Tower 4, Magarpatta","area":"Hadapsar","ward":"Ward-20","ward_num":20,"area_type":"Commercial","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-33","lat":18.5030,"lon":73.9360,"street":"Hadapsar Gadital Bus Stand","area":"Hadapsar","ward":"Ward-20","ward_num":20,"area_type":"Bus Stand","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-34","lat":18.5180,"lon":73.9210,"street":"Amanora Town Centre Mall Gate 2","area":"Hadapsar","ward":"Ward-20","ward_num":20,"area_type":"Mall","cap":500,"city":"Pune"},
    {"bin_id":"BIN-PNQ-35","lat":18.4980,"lon":73.9410,"street":"Pune-Solapur Highway Toll Chowk","area":"Hadapsar","ward":"Ward-20","ward_num":20,"area_type":"Industrial","cap":360,"city":"Pune"},

    {"bin_id":"BIN-PNQ-36","lat":18.5360,"lon":73.8930,"street":"Koregaon Park North Main Road Lane 1","area":"Koregaon Park","ward":"Ward-18","ward_num":18,"area_type":"Restaurant","cap":420,"city":"Pune"},
    {"bin_id":"BIN-PNQ-37","lat":18.5410,"lon":73.8880,"street":"Osho Ashram Lane 3 Promenade","area":"Koregaon Park","ward":"Ward-18","ward_num":18,"area_type":"Park","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-38","lat":18.5580,"lon":73.8050,"street":"Aundh Parihar Chowk Market","area":"Aundh","ward":"Ward-8","ward_num":8,"area_type":"Market","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-39","lat":18.5490,"lon":73.9030,"street":"Kalyani Nagar Joggers Park","area":"Kalyani Nagar","ward":"Ward-6","ward_num":6,"area_type":"Park","cap":240,"city":"Pune"},
    {"bin_id":"BIN-PNQ-40","lat":18.5190,"lon":73.8780,"street":"MG Road Camp Shopping Street","area":"Camp","ward":"Ward-19","ward_num":19,"area_type":"Market","cap":480,"city":"Pune"},

    {"bin_id":"BIN-PNQ-41","lat":18.6250,"lon":73.8000,"street":"Pimpri Chinchwad Municipal Corp Gate","area":"Pimpri","ward":"Ward-PCMC","ward_num":40,"area_type":"Commercial","cap":480,"city":"Pune"},
    {"bin_id":"BIN-PNQ-42","lat":18.5010,"lon":73.8630,"street":"Swargate ST Bus Terminal Square","area":"Swargate","ward":"Ward-25","ward_num":25,"area_type":"Bus Stand","cap":500,"city":"Pune"},
]


# ─────────────────────────────────────────────────────────────
#  AHMEDABAD BINS (AMC) — 42 Bins
# ─────────────────────────────────────────────────────────────
AHMEDABAD_BINS = [
    {"bin_id":"BIN-AMD-01","lat":23.0368,"lon":72.5612,"street":"CG Road Municipal Market, Navrangpura","area":"Navrangpura","ward":"Ward-14","ward_num":14,"area_type":"Market","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-02","lat":23.0330,"lon":72.5650,"street":"Law Garden Night Food Market","area":"Navrangpura","ward":"Ward-14","ward_num":14,"area_type":"Restaurant","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-03","lat":23.0410,"lon":72.5570,"street":"Gujarat University Library Gate","area":"Navrangpura","ward":"Ward-14","ward_num":14,"area_type":"School","cap":360,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-04","lat":23.0290,"lon":72.5690,"street":"Ellisbridge Bus Station Crossing","area":"Navrangpura","ward":"Ward-14","ward_num":14,"area_type":"Bus Stand","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-05","lat":23.0450,"lon":72.5530,"street":"Commerce Six Roads Circle","area":"Navrangpura","ward":"Ward-14","ward_num":14,"area_type":"Commercial","cap":480,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-06","lat":23.0300,"lon":72.5075,"street":"SG Highway ISKCON Temple Circle","area":"SG Highway","ward":"Ward-8","ward_num":8,"area_type":"Commercial","cap":500,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-07","lat":23.0350,"lon":72.5030,"street":"Pakwan Dining Hall Crossroads","area":"SG Highway","ward":"Ward-8","ward_num":8,"area_type":"Restaurant","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-08","lat":23.0250,"lon":72.5120,"street":"Karnavati Club Entrance Gate","area":"SG Highway","ward":"Ward-8","ward_num":8,"area_type":"Commercial","cap":360,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-09","lat":23.0400,"lon":72.4980,"street":"Thaltej Metro Station Forecourt","area":"SG Highway","ward":"Ward-8","ward_num":8,"area_type":"Railway Station","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-10","lat":23.0200,"lon":72.5170,"street":"Sarkhej Sanand Crossroads","area":"SG Highway","ward":"Ward-8","ward_num":8,"area_type":"Industrial","cap":420,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-11","lat":22.9974,"lon":72.6033,"street":"Maninagar Railway Station East Gate","area":"Maninagar","ward":"Ward-36","ward_num":36,"area_type":"Railway Station","cap":500,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-12","lat":22.9930,"lon":72.6070,"street":"Kankaria Lake Gate 1 Promenade","area":"Maninagar","ward":"Ward-36","ward_num":36,"area_type":"Park","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-13","lat":23.0010,"lon":72.5990,"street":"Balvatika Zoo Entrance Road","area":"Maninagar","ward":"Ward-36","ward_num":36,"area_type":"Park","cap":300,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-14","lat":22.9890,"lon":72.6110,"street":"Maninagar Crossroad Vegetable Market","area":"Maninagar","ward":"Ward-36","ward_num":36,"area_type":"Market","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-15","lat":23.0050,"lon":72.5950,"street":"Rambagh Bus Station Sector","area":"Maninagar","ward":"Ward-36","ward_num":36,"area_type":"Bus Stand","cap":420,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-16","lat":23.0360,"lon":72.5310,"street":"Vastrapur Lake Front Promenade","area":"Vastrapur","ward":"Ward-12","ward_num":12,"area_type":"Park","cap":360,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-17","lat":23.0390,"lon":72.5270,"street":"Alpha One Ahmedabad One Mall Gate","area":"Vastrapur","ward":"Ward-12","ward_num":12,"area_type":"Mall","cap":500,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-18","lat":23.0320,"lon":72.5350,"street":"IIM Ahmedabad Main Gate Road","area":"Vastrapur","ward":"Ward-12","ward_num":12,"area_type":"School","cap":360,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-19","lat":23.0430,"lon":72.5230,"street":"Mansi Circle Commercial Centre","area":"Vastrapur","ward":"Ward-12","ward_num":12,"area_type":"Commercial","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-20","lat":23.0280,"lon":72.5390,"street":"Sanjivani Hospital Crossroads","area":"Vastrapur","ward":"Ward-12","ward_num":12,"area_type":"Hospital","cap":480,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-21","lat":23.0510,"lon":72.5710,"street":"Ashram Road Sabarmati Riverfront Promenade","area":"Ashram Road","ward":"Ward-15","ward_num":15,"area_type":"Park","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-22","lat":23.0470,"lon":72.5750,"street":"Gandhi Ashram Main Entrance Lane","area":"Ashram Road","ward":"Ward-15","ward_num":15,"area_type":"Park","cap":300,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-23","lat":23.0550,"lon":72.5670,"street":"Vadaj Bus Terminus Circle","area":"Ashram Road","ward":"Ward-15","ward_num":15,"area_type":"Bus Stand","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-24","lat":23.0420,"lon":72.5790,"street":"Income Tax Office Circle","area":"Ashram Road","ward":"Ward-15","ward_num":15,"area_type":"Commercial","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-25","lat":23.0590,"lon":72.5630,"street":"Dudheshwar Water Works Road","area":"Ashram Road","ward":"Ward-15","ward_num":15,"area_type":"Industrial","cap":360,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-26","lat":23.0280,"lon":72.5220,"street":"Prahlad Nagar Garden Walking Track","area":"Prahlad Nagar","ward":"Ward-9","ward_num":9,"area_type":"Park","cap":240,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-27","lat":23.0240,"lon":72.5260,"street":"Corporate Road Commercial Towers","area":"Prahlad Nagar","ward":"Ward-9","ward_num":9,"area_type":"Commercial","cap":500,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-28","lat":23.0320,"lon":72.5180,"street":"Prahlad Nagar Trade Centre","area":"Prahlad Nagar","ward":"Ward-9","ward_num":9,"area_type":"Commercial","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-29","lat":23.0200,"lon":72.5300,"street":"Anand Nagar Crossroads Market","area":"Prahlad Nagar","ward":"Ward-9","ward_num":9,"area_type":"Market","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-30","lat":23.0360,"lon":72.5140,"street":"Titanium Square Entrance","area":"Prahlad Nagar","ward":"Ward-9","ward_num":9,"area_type":"Restaurant","cap":360,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-31","lat":23.0300,"lon":72.5400,"street":"Shivranjani Crossroads BRTS Stand","area":"Satellite","ward":"Ward-11","ward_num":11,"area_type":"Bus Stand","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-32","lat":23.0250,"lon":72.5440,"street":"Satellite Star Bazaar Mall Gate","area":"Satellite","ward":"Ward-11","ward_num":11,"area_type":"Mall","cap":500,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-33","lat":23.0340,"lon":72.5360,"street":"ISRO Colony Main Road","area":"Satellite","ward":"Ward-11","ward_num":11,"area_type":"Residential","cap":240,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-34","lat":23.0210,"lon":72.5480,"street":"Jodhpur Crossroads Market","area":"Satellite","ward":"Ward-11","ward_num":11,"area_type":"Market","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-35","lat":23.0380,"lon":72.5320,"street":"Ramdev Nagar Commercial Lane","area":"Satellite","ward":"Ward-11","ward_num":11,"area_type":"Commercial","cap":360,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-36","lat":23.0480,"lon":72.5150,"street":"Bodakdev Sindhu Bhavan Road Cafe Row","area":"Bodakdev","ward":"Ward-7","ward_num":7,"area_type":"Restaurant","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-37","lat":23.0530,"lon":72.5100,"street":"Judges Bungalow Road Market","area":"Bodakdev","ward":"Ward-7","ward_num":7,"area_type":"Commercial","cap":480,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-38","lat":23.0780,"lon":72.5850,"street":"Sabarmati Junction Railway Station","area":"Sabarmati","ward":"Ward-SBM","ward_num":2,"area_type":"Railway Station","cap":500,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-39","lat":23.1020,"lon":72.5800,"street":"Chandkheda BRTS Stop Main Road","area":"Chandkheda","ward":"Ward-CHK","ward_num":1,"area_type":"Bus Stand","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-40","lat":23.0120,"lon":72.5620,"street":"Paldi Bhattha Commercial Market","area":"Paldi","ward":"Ward-PLD","ward_num":18,"area_type":"Market","cap":480,"city":"Ahmedabad"},

    {"bin_id":"BIN-AMD-41","lat":23.0320,"lon":72.4650,"street":"South Bopal Commercial Ring Road","area":"Bopal","ward":"Ward-BPL","ward_num":25,"area_type":"Commercial","cap":420,"city":"Ahmedabad"},
    {"bin_id":"BIN-AMD-42","lat":23.0650,"lon":72.6500,"street":"Naroda GIDC Industrial Estate","area":"Naroda","ward":"Ward-NRD","ward_num":30,"area_type":"Industrial","cap":480,"city":"Ahmedabad"},
]


# ─────────────────────────────────────────────────────────────
#  EXPANDED TRUCK FLEET — 41 Trucks across 8 Cities
# ─────────────────────────────────────────────────────────────
EXPANDED_TRUCK_FLEET = [
    # Hyderabad (GHMC) — 6 Trucks
    {"truck_id": "TRK-HYD-01", "plate": "TS09EA0001", "capacity": 5000, "driver": "Ramesh Kumar",   "driver_id": "DRV001", "city": "Hyderabad"},
    {"truck_id": "TRK-HYD-02", "plate": "TS09EA0002", "capacity": 5000, "driver": "Suresh Reddy",    "driver_id": "DRV002", "city": "Hyderabad"},
    {"truck_id": "TRK-HYD-03", "plate": "TS09EA0003", "capacity": 5000, "driver": "Vijay Babu",      "driver_id": "DRV003", "city": "Hyderabad"},
    {"truck_id": "TRK-HYD-04", "plate": "TS09EA0004", "capacity": 5000, "driver": "Naresh Yadav",    "driver_id": "DRV004", "city": "Hyderabad"},
    {"truck_id": "TRK-HYD-05", "plate": "TS09EA0005", "capacity": 4500, "driver": "Prasad Goud",     "driver_id": "DRV005", "city": "Hyderabad"},
    {"truck_id": "TRK-HYD-06", "plate": "TS09EA0006", "capacity": 4000, "driver": "Anil Verma",      "driver_id": "DRV006", "city": "Hyderabad"},

    # Bangalore (BBMP) — 5 Trucks
    {"truck_id": "TRK-BLR-01", "plate": "KA01EA1001", "capacity": 5000, "driver": "Ananth Kumar",    "driver_id": "DRV007", "city": "Bangalore"},
    {"truck_id": "TRK-BLR-02", "plate": "KA01EA1002", "capacity": 5000, "driver": "Manjunath Gowda", "driver_id": "DRV008", "city": "Bangalore"},
    {"truck_id": "TRK-BLR-03", "plate": "KA01EA1003", "capacity": 4500, "driver": "C. Venkatesh",    "driver_id": "DRV009", "city": "Bangalore"},
    {"truck_id": "TRK-BLR-04", "plate": "KA01EA1004", "capacity": 5000, "driver": "Raghavendra Rao", "driver_id": "DRV010", "city": "Bangalore"},
    {"truck_id": "TRK-BLR-05", "plate": "KA01EA1005", "capacity": 4000, "driver": "Naveen Prasad",   "driver_id": "DRV011", "city": "Bangalore"},

    # Mumbai (BMC) — 5 Trucks
    {"truck_id": "TRK-MUM-01", "plate": "MH01EA2001", "capacity": 5000, "driver": "Prakash Patil",   "driver_id": "DRV012", "city": "Mumbai"},
    {"truck_id": "TRK-MUM-02", "plate": "MH01EA2002", "capacity": 5000, "driver": "Sachin Shinde",   "driver_id": "DRV013", "city": "Mumbai"},
    {"truck_id": "TRK-MUM-03", "plate": "MH02EA2003", "capacity": 4500, "driver": "Santosh More",    "driver_id": "DRV014", "city": "Mumbai"},
    {"truck_id": "TRK-MUM-04", "plate": "MH02EA2004", "capacity": 5000, "driver": "Deepak Kamble",   "driver_id": "DRV015", "city": "Mumbai"},
    {"truck_id": "TRK-MUM-05", "plate": "MH01EA2005", "capacity": 4500, "driver": "Sunil Sawant",    "driver_id": "DRV016", "city": "Mumbai"},

    # Delhi (MCD) — 5 Trucks
    {"truck_id": "TRK-DEL-01", "plate": "DL01EA3001", "capacity": 5000, "driver": "Virender Singh",  "driver_id": "DRV017", "city": "Delhi"},
    {"truck_id": "TRK-DEL-02", "plate": "DL01EA3002", "capacity": 5000, "driver": "Rajesh Sharma",   "driver_id": "DRV018", "city": "Delhi"},
    {"truck_id": "TRK-DEL-03", "plate": "DL01EA3003", "capacity": 4500, "driver": "Manoj Kumar",     "driver_id": "DRV019", "city": "Delhi"},
    {"truck_id": "TRK-DEL-04", "plate": "DL01EA3004", "capacity": 5000, "driver": "Harpreet Singh",  "driver_id": "DRV020", "city": "Delhi"},
    {"truck_id": "TRK-DEL-05", "plate": "DL01EA3005", "capacity": 4000, "driver": "Kuldeep Rawat",   "driver_id": "DRV021", "city": "Delhi"},

    # Chennai (GCC) — 5 Trucks
    {"truck_id": "TRK-MAA-01", "plate": "TN01EA4001", "capacity": 5000, "driver": "K. Saravanan",    "driver_id": "DRV022", "city": "Chennai"},
    {"truck_id": "TRK-MAA-02", "plate": "TN01EA4002", "capacity": 4500, "driver": "M. Karthik",      "driver_id": "DRV023", "city": "Chennai"},
    {"truck_id": "TRK-MAA-03", "plate": "TN02EA4003", "capacity": 5000, "driver": "S. Murugan",      "driver_id": "DRV024", "city": "Chennai"},
    {"truck_id": "TRK-MAA-04", "plate": "TN02EA4004", "capacity": 4500, "driver": "P. Senthil",      "driver_id": "DRV025", "city": "Chennai"},
    {"truck_id": "TRK-MAA-05", "plate": "TN01EA4005", "capacity": 4000, "driver": "R. Vignesh",      "driver_id": "DRV026", "city": "Chennai"},

    # Kolkata (KMC) — 5 Trucks
    {"truck_id": "TRK-CCU-01", "plate": "WB01EA5001", "capacity": 5000, "driver": "Subhashish B",    "driver_id": "DRV027", "city": "Kolkata"},
    {"truck_id": "TRK-CCU-02", "plate": "WB01EA5002", "capacity": 4500, "driver": "Amitava Roy",     "driver_id": "DRV028", "city": "Kolkata"},
    {"truck_id": "TRK-CCU-03", "plate": "WB02EA5003", "capacity": 5000, "driver": "Debashis Sen",    "driver_id": "DRV029", "city": "Kolkata"},
    {"truck_id": "TRK-CCU-04", "plate": "WB02EA5004", "capacity": 4500, "driver": "Pradip Ghosh",    "driver_id": "DRV030", "city": "Kolkata"},
    {"truck_id": "TRK-CCU-05", "plate": "WB01EA5005", "capacity": 4000, "driver": "Sourav Mondal",   "driver_id": "DRV031", "city": "Kolkata"},

    # Pune (PMC) — 5 Trucks
    {"truck_id": "TRK-PNQ-01", "plate": "MH12EA6001", "capacity": 5000, "driver": "D. Kadam",        "driver_id": "DRV032", "city": "Pune"},
    {"truck_id": "TRK-PNQ-02", "plate": "MH12EA6002", "capacity": 4500, "driver": "Ganesh More",    "driver_id": "DRV033", "city": "Pune"},
    {"truck_id": "TRK-PNQ-03", "plate": "MH12EA6003", "capacity": 5000, "driver": "Ajay Thorat",     "driver_id": "DRV034", "city": "Pune"},
    {"truck_id": "TRK-PNQ-04", "plate": "MH12EA6004", "capacity": 4500, "driver": "Mahesh Jagtap",   "driver_id": "DRV035", "city": "Pune"},
    {"truck_id": "TRK-PNQ-05", "plate": "MH12EA6005", "capacity": 4000, "driver": "Vikas Bhosale",   "driver_id": "DRV036", "city": "Pune"},

    # Ahmedabad (AMC) — 5 Trucks
    {"truck_id": "TRK-AMD-01", "plate": "GJ01EA7001", "capacity": 5000, "driver": "Jignesh Patel",   "driver_id": "DRV037", "city": "Ahmedabad"},
    {"truck_id": "TRK-AMD-02", "plate": "GJ01EA7002", "capacity": 4500, "driver": "Bhavesh Shah",    "driver_id": "DRV038", "city": "Ahmedabad"},
    {"truck_id": "TRK-AMD-03", "plate": "GJ01EA7003", "capacity": 5000, "driver": "Hitesh Prajapati","driver_id": "DRV039", "city": "Ahmedabad"},
    {"truck_id": "TRK-AMD-04", "plate": "GJ01EA7004", "capacity": 4500, "driver": "Pankaj Solanki",  "driver_id": "DRV040", "city": "Ahmedabad"},
    {"truck_id": "TRK-AMD-05", "plate": "GJ01EA7005", "capacity": 4000, "driver": "Chirag Vaghela",  "driver_id": "DRV041", "city": "Ahmedabad"},
]


# ─────────────────────────────────────────────────────────────
#  EXPANDED DRIVER DETAILS — 41 Drivers
# ─────────────────────────────────────────────────────────────
EXPANDED_DRIVER_DETAILS = [
    {"driver_id":"DRV001","name":"Ramesh Kumar",   "phone":"+91 98765 43210","license":"TS092018001"},
    {"driver_id":"DRV002","name":"Suresh Reddy",    "phone":"+91 98765 43211","license":"TS092018002"},
    {"driver_id":"DRV003","name":"Vijay Babu",      "phone":"+91 98765 43212","license":"TS092018003"},
    {"driver_id":"DRV004","name":"Naresh Yadav",    "phone":"+91 98765 43213","license":"TS092018004"},
    {"driver_id":"DRV005","name":"Prasad Goud",     "phone":"+91 98765 43214","license":"TS092018005"},
    {"driver_id":"DRV006","name":"Anil Verma",      "phone":"+91 98765 43215","license":"TS092018006"},

    {"driver_id":"DRV007","name":"Ananth Kumar",    "phone":"+91 98765 43216","license":"KA012019001"},
    {"driver_id":"DRV008","name":"Manjunath Gowda", "phone":"+91 98765 43217","license":"KA012019002"},
    {"driver_id":"DRV009","name":"C. Venkatesh",    "phone":"+91 98765 43218","license":"KA012019003"},
    {"driver_id":"DRV010","name":"Raghavendra Rao", "phone":"+91 98765 43219","license":"KA012019004"},
    {"driver_id":"DRV011","name":"Naveen Prasad",   "phone":"+91 98765 43220","license":"KA012019005"},

    {"driver_id":"DRV012","name":"Prakash Patil",   "phone":"+91 98765 43221","license":"MH012017001"},
    {"driver_id":"DRV013","name":"Sachin Shinde",   "phone":"+91 98765 43222","license":"MH012017002"},
    {"driver_id":"DRV014","name":"Santosh More",    "phone":"+91 98765 43223","license":"MH022017003"},
    {"driver_id":"DRV015","name":"Deepak Kamble",   "phone":"+91 98765 43224","license":"MH022017004"},
    {"driver_id":"DRV016","name":"Sunil Sawant",    "phone":"+91 98765 43225","license":"MH012017005"},

    {"driver_id":"DRV017","name":"Virender Singh",  "phone":"+91 98765 43226","license":"DL012020001"},
    {"driver_id":"DRV018","name":"Rajesh Sharma",   "phone":"+91 98765 43227","license":"DL012020002"},
    {"driver_id":"DRV019","name":"Manoj Kumar",     "phone":"+91 98765 43228","license":"DL012020003"},
    {"driver_id":"DRV020","name":"Harpreet Singh",  "phone":"+91 98765 43229","license":"DL012020004"},
    {"driver_id":"DRV021","name":"Kuldeep Rawat",   "phone":"+91 98765 43230","license":"DL012020005"},

    {"driver_id":"DRV022","name":"K. Saravanan",    "phone":"+91 98765 43231","license":"TN012018001"},
    {"driver_id":"DRV023","name":"M. Karthik",      "phone":"+91 98765 43232","license":"TN012018002"},
    {"driver_id":"DRV024","name":"S. Murugan",      "phone":"+91 98765 43233","license":"TN022018003"},
    {"driver_id":"DRV025","name":"P. Senthil",      "phone":"+91 98765 43234","license":"TN022018004"},
    {"driver_id":"DRV026","name":"R. Vignesh",      "phone":"+91 98765 43235","license":"TN012018005"},

    {"driver_id":"DRV027","name":"Subhashish B",    "phone":"+91 98765 43236","license":"WB012019001"},
    {"driver_id":"DRV028","name":"Amitava Roy",     "phone":"+91 98765 43237","license":"WB012019002"},
    {"driver_id":"DRV029","name":"Debashis Sen",    "phone":"+91 98765 43238","license":"WB022019003"},
    {"driver_id":"DRV030","name":"Pradip Ghosh",    "phone":"+91 98765 43239","license":"WB022019004"},
    {"driver_id":"DRV031","name":"Sourav Mondal",   "phone":"+91 98765 43240","license":"WB012019005"},

    {"driver_id":"DRV032","name":"D. Kadam",        "phone":"+91 98765 43241","license":"MH122018001"},
    {"driver_id":"DRV033","name":"Ganesh More",    "phone":"+91 98765 43242","license":"MH122018002"},
    {"driver_id":"DRV034","name":"Ajay Thorat",     "phone":"+91 98765 43243","license":"MH122018003"},
    {"driver_id":"DRV035","name":"Mahesh Jagtap",   "phone":"+91 98765 43244","license":"MH122018004"},
    {"driver_id":"DRV036","name":"Vikas Bhosale",   "phone":"+91 98765 43245","license":"MH122018005"},

    {"driver_id":"DRV037","name":"Jignesh Patel",   "phone":"+91 98765 43246","license":"GJ012019001"},
    {"driver_id":"DRV038","name":"Bhavesh Shah",    "phone":"+91 98765 43247","license":"GJ012019002"},
    {"driver_id":"DRV039","name":"Hitesh Prajapati","phone":"+91 98765 43248","license":"GJ012019003"},
    {"driver_id":"DRV040","name":"Pankaj Solanki",  "phone":"+91 98765 43249","license":"GJ012019004"},
    {"driver_id":"DRV041","name":"Chirag Vaghela",  "phone":"+91 98765 43250","license":"GJ012019005"},
]
