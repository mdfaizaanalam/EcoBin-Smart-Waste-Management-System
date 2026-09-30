"""
Database Seeder for Multi-City Maintenance Workers, Maintenance Logs, and Notifications
Ensures 100% production-level data across all 8 supported municipal corporations:
Hyderabad, Bangalore, Mumbai, Delhi, Chennai, Kolkata, Pune, Ahmedabad.
"""
import os
import sys
import datetime
import random
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))
from sqlalchemy import text
from database.db import SessionLocal, engine
from database.models import MaintenanceWorker, MaintenanceLog, Notification, Bin

CITY_DEPOTS_MAP = {
    "Hyderabad": {"latitude": 17.3850, "longitude": 78.4867},
    "Bangalore": {"latitude": 12.9716, "longitude": 77.5946},
    "Mumbai": {"latitude": 19.0760, "longitude": 72.8777},
    "Delhi": {"latitude": 28.6139, "longitude": 77.2090},
    "Chennai": {"latitude": 13.0827, "longitude": 80.2707},
    "Kolkata": {"latitude": 22.5726, "longitude": 88.3639},
    "Pune": {"latitude": 18.5204, "longitude": 73.8567},
    "Ahmedabad": {"latitude": 23.0225, "longitude": 72.5714},
}

CITY_WORKERS = {
    "Hyderabad": [
        {"worker_id": "MNT-HYD-01", "name": "Arun Sharma", "phone": "+91 99001 11001", "zone": "Banjara Hills / Jubilee Hills", "city": "Hyderabad"},
        {"worker_id": "MNT-HYD-02", "name": "Sujatha Devi", "phone": "+91 99001 11002", "zone": "Begumpet / Secunderabad", "city": "Hyderabad"},
        {"worker_id": "MNT-HYD-03", "name": "Ravi Kiran", "phone": "+91 99001 11003", "zone": "Kukatpally / KPHB", "city": "Hyderabad"},
        {"worker_id": "MNT-HYD-04", "name": "Priya Nair", "phone": "+91 99001 11004", "zone": "LB Nagar / Dilsukhnagar", "city": "Hyderabad"},
    ],
    "Bangalore": [
        {"worker_id": "MNT-BLR-01", "name": "Chetan Gowda", "phone": "+91 98450 21001", "zone": "Indiranagar / Koramangala", "city": "Bangalore"},
        {"worker_id": "MNT-BLR-02", "name": "Deepa Murthy", "phone": "+91 98450 21002", "zone": "Whitefield / Marathahalli", "city": "Bangalore"},
        {"worker_id": "MNT-BLR-03", "name": "Karthik Raja", "phone": "+91 98450 21003", "zone": "Jayanagar / JP Nagar", "city": "Bangalore"},
        {"worker_id": "MNT-BLR-04", "name": "Shwetha Rao", "phone": "+91 98450 21004", "zone": "Malleshwaram / Rajajinagar", "city": "Bangalore"},
    ],
    "Mumbai": [
        {"worker_id": "MNT-MUM-01", "name": "Sanjay Patil", "phone": "+91 98200 31001", "zone": "Bandra / Khar West", "city": "Mumbai"},
        {"worker_id": "MNT-MUM-02", "name": "Meera Sawant", "phone": "+91 98200 31002", "zone": "Andheri / Juhu Link Road", "city": "Mumbai"},
        {"worker_id": "MNT-MUM-03", "name": "Ganesh Kadam", "phone": "+91 98200 31003", "zone": "Dadar / Worli Seaface", "city": "Mumbai"},
        {"worker_id": "MNT-MUM-04", "name": "Sneha Deshmukh", "phone": "+91 98200 31004", "zone": "Colaba / Fort Heritage", "city": "Mumbai"},
    ],
    "Delhi": [
        {"worker_id": "MNT-DEL-01", "name": "Virender Singh", "phone": "+91 98110 41001", "zone": "Connaught Place / Karol Bagh", "city": "Delhi"},
        {"worker_id": "MNT-DEL-02", "name": "Pooja Verma", "phone": "+91 98110 41002", "zone": "Hauz Khas / Saket South", "city": "Delhi"},
        {"worker_id": "MNT-DEL-03", "name": "Amit Bhati", "phone": "+91 98110 41003", "zone": "Rohini / Pitampura North", "city": "Delhi"},
        {"worker_id": "MNT-DEL-04", "name": "Rajesh Kumar", "phone": "+91 98110 41004", "zone": "Lajpat Nagar / Defence Colony", "city": "Delhi"},
    ],
    "Chennai": [
        {"worker_id": "MNT-MAA-01", "name": "Saravanan K.", "phone": "+91 98400 51001", "zone": "T. Nagar / Kodambakkam", "city": "Chennai"},
        {"worker_id": "MNT-MAA-02", "name": "Kavitha Rajan", "phone": "+91 98400 51002", "zone": "Adyar / Besant Nagar Beach", "city": "Chennai"},
        {"worker_id": "MNT-MAA-03", "name": "Mani Maran", "phone": "+91 98400 51003", "zone": "Anna Nagar / Kilpauk", "city": "Chennai"},
        {"worker_id": "MNT-MAA-04", "name": "Revathi Natarajan", "phone": "+91 98400 51004", "zone": "Mylapore / Santhome Coast", "city": "Chennai"},
    ],
    "Kolkata": [
        {"worker_id": "MNT-CCU-01", "name": "Subhash Ghosh", "phone": "+91 98300 61001", "zone": "Park Street / Esplanade Central", "city": "Kolkata"},
        {"worker_id": "MNT-CCU-02", "name": "Ananya Mukherjee", "phone": "+91 98300 61002", "zone": "Salt Lake / Sector V Tech Hub", "city": "Kolkata"},
        {"worker_id": "MNT-CCU-03", "name": "Debabrata Sen", "phone": "+91 98300 61003", "zone": "Ballygunge / Gariahat South", "city": "Kolkata"},
        {"worker_id": "MNT-CCU-04", "name": "Mousumi Das", "phone": "+91 98300 61004", "zone": "Howrah Bridge / Shyambazar", "city": "Kolkata"},
    ],
    "Pune": [
        {"worker_id": "MNT-PNQ-01", "name": "Nitin Shinde", "phone": "+91 98500 71001", "zone": "Kothrud / Karve Road", "city": "Pune"},
        {"worker_id": "MNT-PNQ-02", "name": "Archana Joshi", "phone": "+91 98500 71002", "zone": "Shivajinagar / FC Road", "city": "Pune"},
        {"worker_id": "MNT-PNQ-03", "name": "Prashant Jagtap", "phone": "+91 98500 71003", "zone": "Hinjawadi / Wakad IT Belt", "city": "Pune"},
        {"worker_id": "MNT-PNQ-04", "name": "Kalyani More", "phone": "+91 98500 71004", "zone": "Viman Nagar / Kalyani Nagar", "city": "Pune"},
    ],
    "Ahmedabad": [
        {"worker_id": "MNT-AMD-01", "name": "Jignesh Patel", "phone": "+91 98250 81001", "zone": "Navrangpura / CG Road", "city": "Ahmedabad"},
        {"worker_id": "MNT-AMD-02", "name": "Dipti Shah", "phone": "+91 98250 81002", "zone": "Satellite / Prahlad Nagar", "city": "Ahmedabad"},
        {"worker_id": "MNT-AMD-03", "name": "Hardik Trivedi", "phone": "+91 98250 81003", "zone": "Bodakdev / SG Highway", "city": "Ahmedabad"},
        {"worker_id": "MNT-AMD-04", "name": "Bhavna Solanki", "phone": "+91 98250 81004", "zone": "Maninagar / Kankaria Lake", "city": "Ahmedabad"},
    ],
}

MAINTENANCE_ISSUES = [
    {"issue_type": "Ultrasonic Sensor Fault", "notes": "Erratic distance readings reported by driver.", "priority": "High"},
    {"issue_type": "Damaged Smart Lid", "notes": "Mechanical hinge bent due to heavy impact.", "priority": "Medium"},
    {"issue_type": "Battery Low Discharge", "notes": "Battery level dropped below 15% threshold.", "priority": "Medium"},
    {"issue_type": "Severe Overflow Damage", "notes": "Waste spillover requiring immediate sanitation cleanup.", "priority": "Critical"},
    {"issue_type": "PIR Tamper Alert", "notes": "Tampering detected near sensor housing.", "priority": "High"},
]

def ensure_columns_and_seed():
    """Migrates schema if necessary and populates initial workers, jobs, and notifications."""
    print("[Seed] Ensuring database columns and initial data...")
    # Add city column to maintenance_workers if not exists
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE maintenance_workers ADD COLUMN IF NOT EXISTS city VARCHAR(50) DEFAULT 'Hyderabad';"))
            conn.commit()
            print("  [OK] Checked/added 'city' column in maintenance_workers")
        except Exception as e:
            print(f"  [Notice] Schema check: {e}")

    db = SessionLocal()
    try:
        now = datetime.datetime.now()
        
        # 1. Seed / Update Workers for All 8 Cities
        for city, workers in CITY_WORKERS.items():
            for w in workers:
                existing = db.query(MaintenanceWorker).filter(MaintenanceWorker.worker_id == w["worker_id"]).first()
                if not existing:
                    db.add(MaintenanceWorker(
                        worker_id=w["worker_id"],
                        name=w["name"],
                        phone=w["phone"],
                        zone=w["zone"],
                        city=w["city"],
                        status="Available",
                        is_active=True,
                        language="en",
                        created_at=now - datetime.timedelta(days=15)
                    ))
                else:
                    existing.city = w["city"]
                    existing.zone = w["zone"]
        db.commit()
        print(f"  [OK] Seeded/updated {sum(len(v) for v in CITY_WORKERS.values())} maintenance workers across 8 cities.")

        # 2. Seed Maintenance Logs per City
        all_cities = list(CITY_WORKERS.keys())
        for city in all_cities:
            city_bins = db.query(Bin).filter(Bin.city == city).all()
            if not city_bins:
                continue
            
            existing_logs_count = db.query(MaintenanceLog).join(Bin, MaintenanceLog.bin_id == Bin.bin_id).filter(Bin.city == city).count()
            if existing_logs_count < 3:
                workers = db.query(MaintenanceWorker).filter(MaintenanceWorker.city == city).all()
                if not workers:
                    continue
                
                # Pick 3 distinct bins for jobs
                sample_bins = random.sample(city_bins, min(4, len(city_bins)))
                
                # Job 1: In Progress
                b1 = sample_bins[0]
                w1 = workers[0]
                w1.status = "On Job"
                b1.status = "Maintenance"
                db.add(MaintenanceLog(
                    bin_id=b1.bin_id,
                    worker_id=w1.worker_id,
                    issue_type="Ultrasonic Sensor Fault",
                    notes=f"Sensor readings inconsistent on {b1.street_name}.",
                    reported_by="TRK-01",
                    status="In Progress",
                    priority="High",
                    reported_at=now - datetime.timedelta(hours=3),
                    assigned_at=now - datetime.timedelta(hours=2),
                ))

                # Job 2: Open
                b2 = sample_bins[1]
                b2.status = "Maintenance"
                db.add(MaintenanceLog(
                    bin_id=b2.bin_id,
                    worker_id=None,
                    issue_type="Damaged Smart Lid",
                    notes=f"Lid jammed at {b2.street_name}. Field repair needed.",
                    reported_by="Inspector-02",
                    status="Open",
                    priority="Medium",
                    reported_at=now - datetime.timedelta(hours=1),
                ))

                # Job 3: Resolved Today
                b3 = sample_bins[2]
                w2 = workers[1]
                db.add(MaintenanceLog(
                    bin_id=b3.bin_id,
                    worker_id=w2.worker_id,
                    issue_type="Battery Low Discharge",
                    notes=f"Replaced 3.7V Li-ion pack at {b3.street_name}.",
                    reported_by="Auto-Telemetry",
                    status="Resolved",
                    priority="Medium",
                    reported_at=now - datetime.timedelta(hours=5),
                    assigned_at=now - datetime.timedelta(hours=4),
                    resolved_at=now - datetime.timedelta(minutes=30),
                    resolution_notes="Battery pack replaced. Tested 100% telemetry ping."
                ))

                # Job 4: Resolved (yesterday)
                if len(sample_bins) > 3:
                    b4 = sample_bins[3]
                    w3 = workers[2]
                    db.add(MaintenanceLog(
                        bin_id=b4.bin_id,
                        worker_id=w3.worker_id,
                        issue_type="Severe Overflow Damage",
                        notes=f"Emergency sanitation and pressure wash.",
                        reported_by="Citizen Alert",
                        status="Resolved",
                        priority="Critical",
                        reported_at=now - datetime.timedelta(days=1, hours=4),
                        assigned_at=now - datetime.timedelta(days=1, hours=3),
                        resolved_at=now - datetime.timedelta(days=1, hours=1),
                        resolution_notes="Sanitized and bin restored to full capacity."
                    ))
        db.commit()
        print("  [OK] Seeded realistic maintenance logs across all cities.")

        # 3. Seed Realistic Notifications per City
        for city in all_cities:
            city_bins = db.query(Bin).filter(Bin.city == city).all()
            if not city_bins:
                continue

            existing_notifs = db.query(Notification).join(Bin, Notification.bin_id == Bin.bin_id).filter(Bin.city == city).count()
            if existing_notifs < 2:
                # Find high-fill bins or assign a few for notification showcase
                high_fill_bins = [b for b in city_bins if (b.current_fill_percentage or 0) >= 70]
                if len(high_fill_bins) < 3:
                    high_fill_bins = city_bins[:4]
                    # Update a couple fill levels to be realistic critical/warning
                    city_bins[0].current_fill_percentage = 96.5
                    city_bins[1].current_fill_percentage = 88.0
                    city_bins[2].current_fill_percentage = 82.5

                # Create 3-4 notifications
                for idx, b in enumerate(high_fill_bins[:4]):
                    fill = b.current_fill_percentage or 85.0
                    sev = "Critical" if fill >= 90 else "Warning"
                    notif = Notification(
                        bin_id=b.bin_id,
                        severity=sev,
                        title=f"Bin {b.bin_id} Overflow Alert",
                        message=(
                            f"Bin {b.bin_id} at {b.street_name or 'Main Road'} ({b.area_name or city}) "
                            f"has reached {fill:.1f}% capacity. Immediate collection required. "
                            f"Ward: {b.ward or 'General'}."
                        ),
                        is_read=False,
                        created_at=now - datetime.timedelta(minutes=15 * (idx + 1))
                    )
                    db.add(notif)
        # 4. Seed Multi-City Recycling Centers & MRF Facilities
        from database.models import RecyclingCenter, MaterialRecoveryLog, CitizenReport

        CITY_RECYCLING_CENTERS = {
            "Delhi": [
                {"center_id": "DEL-MRF-01", "name": "Okhla Integrated Waste & Resource Recovery Complex", "facility_type": "MRF & Waste-to-Energy", "latitude": 28.5355, "longitude": 77.2750, "address": "Okhla Phase-1 Industrial Area", "city": "Delhi", "daily_capacity_tons": 150.0, "current_utilization": 82.0, "contact_phone": "+91 11 2681 4455"},
                {"center_id": "DEL-CMP-02", "name": "Ghazipur Bio-Methanation & Organic Fertilizer Facility", "facility_type": "Composting / Bio-CNG", "latitude": 28.6250, "longitude": 77.3280, "address": "Ghazipur Landfill Reclamation Site", "city": "Delhi", "daily_capacity_tons": 180.0, "current_utilization": 86.5, "contact_phone": "+91 11 2277 8899"},
                {"center_id": "DEL-EWT-03", "name": "Narela-Bawana E-Waste Smelter & Precious Metal Recovery", "facility_type": "E-Waste Refurbisher & Smelter", "latitude": 28.8400, "longitude": 77.0900, "address": "Bawana Industrial Area Sector 4", "city": "Delhi", "daily_capacity_tons": 35.0, "current_utilization": 68.0, "contact_phone": "+91 11 2775 3322"},
                {"center_id": "DEL-PLS-04", "name": "Rohini Polymer Pyrolysis & Circular Resin Plant", "facility_type": "Plastic-to-Fuel Recycling", "latitude": 28.7100, "longitude": 77.1100, "address": "Rohini Sector 28 Industrial Hub", "city": "Delhi", "daily_capacity_tons": 50.0, "current_utilization": 74.0, "contact_phone": "+91 11 2704 1100"},
            ],
            "Mumbai": [
                {"center_id": "MUM-MRF-01", "name": "Dharavi Circular Micro-Economy & Secondary Plastic Hub", "facility_type": "MRF (Dry Recyclables)", "latitude": 19.0430, "longitude": 72.8550, "address": "90 Feet Road, Dharavi Leather & Plastic Belt", "city": "Mumbai", "daily_capacity_tons": 110.0, "current_utilization": 89.0, "contact_phone": "+91 22 2407 8899"},
                {"center_id": "MUM-CMP-02", "name": "Deonar Biomethanation & Renewable Bio-CNG Terminal", "facility_type": "Composting / Bio-CNG", "latitude": 19.0600, "longitude": 72.9200, "address": "Govandi Deonar Reclamation Zone", "city": "Mumbai", "daily_capacity_tons": 200.0, "current_utilization": 81.0, "contact_phone": "+91 22 2555 4321"},
                {"center_id": "MUM-EWT-03", "name": "Bhandup Electronic Takeback & Urban Mining Depot", "facility_type": "E-Waste Refurbisher & Smelter", "latitude": 19.1450, "longitude": 72.9350, "address": "LBS Marg, Bhandup West", "city": "Mumbai", "daily_capacity_tons": 40.0, "current_utilization": 64.0, "contact_phone": "+91 22 2596 7711"},
            ],
            "Bangalore": [
                {"center_id": "BLR-MRF-01", "name": "Peenya Sustainable Dry Waste Aggregation Center", "facility_type": "MRF (Dry Recyclables)", "latitude": 13.0300, "longitude": 77.5200, "address": "Peenya 2nd Stage Industrial Area", "city": "Bangalore", "daily_capacity_tons": 90.0, "current_utilization": 77.5, "contact_phone": "+91 80 2839 5500"},
                {"center_id": "BLR-CMP-02", "name": "Kannahalli Biomethanation & Bio-CNG Energy Plant", "facility_type": "Composting / Bio-CNG", "latitude": 12.9650, "longitude": 77.4600, "address": "Kannahalli Processing Campus", "city": "Bangalore", "daily_capacity_tons": 160.0, "current_utilization": 83.0, "contact_phone": "+91 80 2344 1122"},
                {"center_id": "BLR-EWT-03", "name": "Whitefield Silicon Tech E-Waste Circular Hub", "facility_type": "E-Waste Refurbisher & Smelter", "latitude": 12.9850, "longitude": 77.7400, "address": "EPIP Zone, Whitefield", "city": "Bangalore", "daily_capacity_tons": 45.0, "current_utilization": 72.0, "contact_phone": "+91 80 4118 9900"},
            ],
            "Pune": [
                {"center_id": "PUN-MRF-01", "name": "Hadapsar Industrial Dry Waste Segregation Terminal", "facility_type": "MRF (Dry Recyclables)", "latitude": 18.5000, "longitude": 73.9300, "address": "Hadapsar Industrial Estate", "city": "Pune", "daily_capacity_tons": 80.0, "current_utilization": 76.0, "contact_phone": "+91 20 2687 4411"},
                {"center_id": "PUN-CMP-02", "name": "Rochem Bio-CNG & Organic Fuel Complex", "facility_type": "Composting / Bio-CNG", "latitude": 18.5350, "longitude": 73.8150, "address": "Kothrud Paud Road SWM Terminal", "city": "Pune", "daily_capacity_tons": 100.0, "current_utilization": 79.0, "contact_phone": "+91 20 2544 3300"},
                {"center_id": "PUN-EWT-03", "name": "Hinjawadi IT Corridor E-Waste Refurbishment Center", "facility_type": "E-Waste Refurbisher & Smelter", "latitude": 18.5900, "longitude": 73.7400, "address": "Hinjawadi Phase-1 IT Park", "city": "Pune", "daily_capacity_tons": 30.0, "current_utilization": 65.0, "contact_phone": "+91 20 6654 2200"},
            ],
            "Ahmedabad": [
                {"center_id": "AMD-MRF-01", "name": "Pirana Resource Recovery & Scientific Sifting Facility", "facility_type": "MRF & Plastic-to-Fuel", "latitude": 22.9800, "longitude": 72.5600, "address": "Pirana Dumpsite Remediation Zone", "city": "Ahmedabad", "daily_capacity_tons": 120.0, "current_utilization": 84.0, "contact_phone": "+91 79 2532 1100"},
                {"center_id": "AMD-CMP-02", "name": "Vatva GIDC Organic Biomethanation Plant", "facility_type": "Composting / Bio-CNG", "latitude": 22.9550, "longitude": 72.6350, "address": "Phase-IV, Vatva GIDC", "city": "Ahmedabad", "daily_capacity_tons": 90.0, "current_utilization": 72.0, "contact_phone": "+91 79 2583 6644"},
                {"center_id": "AMD-PLS-03", "name": "Sabarmati Circular Polymer Regeneration Unit", "facility_type": "Plastic Pyrolysis & Flaking", "latitude": 23.0800, "longitude": 72.5800, "address": "D-Cabin Road, Sabarmati", "city": "Ahmedabad", "daily_capacity_tons": 45.0, "current_utilization": 69.0, "contact_phone": "+91 79 2750 9988"},
            ],
            "Chennai": [
                {"center_id": "MAA-MRF-01", "name": "Perungudi Coastal Resource Recovery Facility", "facility_type": "MRF (Dry Recyclables)", "latitude": 12.9400, "longitude": 80.2200, "address": "OMR IT Corridor, Perungudi", "city": "Chennai", "daily_capacity_tons": 95.0, "current_utilization": 78.0, "contact_phone": "+91 44 2496 1122"},
                {"center_id": "MAA-CMP-02", "name": "Kodungaiyur Bio-CNG & Organic Slurry Plant", "facility_type": "Composting / Bio-CNG", "latitude": 13.1400, "longitude": 80.2600, "address": "Kodungaiyur Processing Zone", "city": "Chennai", "daily_capacity_tons": 130.0, "current_utilization": 81.0, "contact_phone": "+91 44 2558 7700"},
            ],
            "Kolkata": [
                {"center_id": "CCU-MRF-01", "name": "Dhapa Scientific Waste Processing Complex", "facility_type": "MRF & Bio-Compost", "latitude": 22.5400, "longitude": 88.4200, "address": "EM Bypass, Dhapa Wetlands", "city": "Kolkata", "daily_capacity_tons": 115.0, "current_utilization": 75.0, "contact_phone": "+91 33 2345 8899"},
                {"center_id": "CCU-EWT-02", "name": "Salt Lake Sector-V E-Waste Takeback Depot", "facility_type": "E-Waste Refurbisher & Smelter", "latitude": 22.5750, "longitude": 88.4350, "address": "Sector V Electronics Complex", "city": "Kolkata", "daily_capacity_tons": 35.0, "current_utilization": 63.0, "contact_phone": "+91 33 2367 4411"},
            ],
            "Hyderabad": [
                {"center_id": "HYD-MRF-01", "name": "Hitec City Material Recovery Facility", "facility_type": "MRF (Dry Recyclables)", "latitude": 17.4435, "longitude": 78.3772, "address": "Madhapur Industrial Area", "city": "Hyderabad", "daily_capacity_tons": 75.0, "current_utilization": 78.5, "contact_phone": "+91 40 2311 8900"},
                {"center_id": "HYD-CMP-02", "name": "Jawaharnagar Biomethanation & Compost Plant", "facility_type": "Composting / Bio-CNG", "latitude": 17.5120, "longitude": 78.5840, "address": "Jawaharnagar Waste Complex", "city": "Hyderabad", "daily_capacity_tons": 120.0, "current_utilization": 84.0, "contact_phone": "+91 40 2712 4432"},
                {"center_id": "HYD-EWT-03", "name": "Hyderabad E-Waste Circular Hub", "facility_type": "E-Waste Refurbisher & Smelter", "latitude": 17.3850, "longitude": 78.4867, "address": "Kattedan Industrial Area", "city": "Hyderabad", "daily_capacity_tons": 25.0, "current_utilization": 62.0, "contact_phone": "+91 40 2444 1122"},
                {"center_id": "HYD-PLS-04", "name": "Telangana Plastic Pyrolysis Center", "facility_type": "Plastic-to-Fuel Recycling", "latitude": 17.4850, "longitude": 78.3550, "address": "Balanagar Industrial Estate", "city": "Hyderabad", "daily_capacity_tons": 40.0, "current_utilization": 71.2, "contact_phone": "+91 40 2377 8899"}
            ]
        }

        for city_name, centers in CITY_RECYCLING_CENTERS.items():
            for c in centers:
                existing = db.query(RecyclingCenter).filter(RecyclingCenter.center_id == c["center_id"]).first()
                if not existing:
                    db.add(RecyclingCenter(
                        center_id=c["center_id"],
                        name=c["name"],
                        facility_type=c["facility_type"],
                        latitude=c["latitude"],
                        longitude=c["longitude"],
                        address=c["address"],
                        city=c["city"],
                        daily_capacity_tons=c["daily_capacity_tons"],
                        current_utilization=c["current_utilization"],
                        contact_phone=c["contact_phone"],
                        is_active=True
                    ))
        db.commit()
        print("  [OK] Seeded Multi-City Recycling Facilities across all 8 Indian Metros.")

        # 5. Seed Material Recovery Batches for all cities
        sample_batches = [
            ("DEL-MRF-01", "Plastic-PET Flakes", "Recyclable", 1450.0, 2175.0, 26100.0, "Delhi NCR Recycled Yarns"),
            ("DEL-CMP-02", "Enriched Bio-Compost", "Organic", 4200.0, 2100.0, 12600.0, "Haryana Agro Urban Greening"),
            ("MUM-MRF-01", "High-Density PE Regrind", "Recyclable", 980.0, 2058.0, 43120.0, "Maharashtra Industrial Pipes"),
            ("BLR-EWT-03", "Refined PCB Copper Wire", "E-Waste", 220.0, 1056.0, 150700.0, "Karnataka Metallurgical Smelters"),
            ("PUN-CMP-02", "Compressed Bio-CNG Fuel", "Organic", 3100.0, 2790.0, 18600.0, "PMPML Green City Bus Fleet"),
            ("AMD-MRF-01", "Baled Corrugated Kraft", "Recyclable", 2800.0, 3220.0, 35000.0, "Gujarat Packaging Paper Mills"),
            ("HYD-MRF-01", "Aluminum Can Briquettes", "Recyclable", 520.0, 2184.0, 23400.0, "Telangana Foundry Castings"),
            ("CCU-MRF-01", "Dhapa Flaked PET (Clear Bottles)", "Recyclable", 1650.0, 2475.0, 29700.0, "West Bengal EcoPlast Polymers"),
            ("CCU-MRF-01", "Dhapa Enriched Bio-Compost", "Organic", 3800.0, 1900.0, 11400.0, "Kolkata Agri & Wetland Nurseries"),
            ("CCU-EWT-02", "Salt Lake Refurbished PCB Copper", "E-Waste", 210.0, 1680.0, 147000.0, "Bengal High-Tech Metallurgy"),
            ("MAA-MRF-01", "Baled Coastal Plastic PET", "Recyclable", 1400.0, 2100.0, 25200.0, "Tamil Nadu Recycled Textiles"),
            ("MAA-CMP-02", "Kodungaiyur High-Grade Compost", "Organic", 4100.0, 2050.0, 12300.0, "Cauvery Delta Organic Greening")
        ]
        for cid, mtype, cat, wt, co2, rev, buyer in sample_batches:
            existing = db.query(MaterialRecoveryLog).filter(MaterialRecoveryLog.center_id == cid).first()
            if not existing:
                db.add(MaterialRecoveryLog(
                    center_id=cid,
                    material_type=mtype,
                    category=cat,
                    weight_kg=wt,
                    co2_offset_kg=co2,
                    revenue_generated_inr=rev,
                    buyer_industry=buyer,
                    date_processed=datetime.date.today()
                ))
        db.commit()
        print("  [OK] Seeded Material Recovery Batches across all 8 Indian Metros.")

        # 6. Seed Realistic Citizen Reports for all cities
        for city in all_cities:
            has_report = db.query(CitizenReport).filter(CitizenReport.city == city).first()
            if not has_report:
                depot = CITY_DEPOTS_MAP.get(city, {"latitude": 17.3850, "longitude": 78.4867})
                dlat, dlon = depot["latitude"], depot["longitude"]
                db.add(CitizenReport(
                    report_type="illegal_dumping",
                    citizen_name=f"Civic Volunteer ({city})",
                    citizen_phone="+91 98000 12345",
                    latitude=dlat + 0.012,
                    longitude=dlon + 0.008,
                    address=f"Commercial Arterial Road, {city}",
                    city=city,
                    description="Commercial packaging and plastic waste overflow near public transit terminal.",
                    ai_classification="Mixed Plastic / Cardboard - Moderate Priority",
                    status="Pending",
                    reward_points_awarded=75,
                    created_at=now - datetime.timedelta(hours=2)
                ))
                db.add(CitizenReport(
                    report_type="e_waste_pickup",
                    citizen_name=f"Resident Welfare ({city})",
                    citizen_phone="+91 98000 54321",
                    latitude=dlat - 0.009,
                    longitude=dlon - 0.011,
                    address=f"Residential Society Gate 2, {city}",
                    city=city,
                    description="Community e-waste collection bin ready with discarded batteries and phone chargers.",
                    ai_classification="E-Waste Takeback - Verified",
                    status="Scheduled",
                    reward_points_awarded=150,
                    created_at=now - datetime.timedelta(hours=5)
                ))
        db.commit()
        print("  [OK] Seeded Multi-City Citizen Reports & Circular Recovery Records.")

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    ensure_columns_and_seed()
