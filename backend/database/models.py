"""
Database Models — Smart Waste Management Platform
SQLAlchemy ORM definitions for all tables.
Production-ready schema designed for IoT integration with ESP32 hardware.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, 
    Date, ForeignKey, Text, Enum
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()


# ─────────────────────────────────────────────────────────────
#  ENUMERATIONS
# ─────────────────────────────────────────────────────────────

class BinStatus(str, enum.Enum):
    ACTIVE = "Active"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"
    COLLECTED = "Collected"

class TruckStatus(str, enum.Enum):
    IDLE = "Idle"
    EN_ROUTE = "En Route"
    COLLECTING = "Collecting"
    MAINTENANCE = "Maintenance"
    INACTIVE = "Inactive"

class NotificationSeverity(str, enum.Enum):
    CRITICAL = "Critical"
    WARNING = "Warning"
    INFO = "Info"


# ─────────────────────────────────────────────────────────────
#  BINS
# ─────────────────────────────────────────────────────────────

class Bin(Base):
    """
    Represents a physical smart waste bin in the field.
    Compatible with ESP32+Ultrasonic Sensor hardware.
    GPS coordinates stored for real-time GIS mapping.
    """
    __tablename__ = 'bins'

    bin_id = Column(String(50), primary_key=True)          # e.g. BIN001
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    street_name = Column(String(200), nullable=False)
    area_name = Column(String(100), nullable=False)        # e.g. Banjara Hills
    ward = Column(String(100), nullable=False)             # e.g. Ward-7
    ward_number = Column(Integer, nullable=False, default=1)
    area_type = Column(String(50), nullable=False)         # Residential, Market, etc.
    capacity = Column(Float, nullable=False)               # in liters
    city = Column(String(100), nullable=False, default="Hyderabad") # City name (Hyderabad, Bangalore, Mumbai, Delhi, etc.)
    waste_category = Column(String(50), nullable=False, default="general") # general, food_waste, paper, glass, plastic, e_waste, metal

    # Live IoT State (updated on each hardware push)
    current_fill_percentage = Column(Float, nullable=False, default=0.0)
    battery_level = Column(Float, nullable=True, default=100.0)    # 0-100%
    signal_strength = Column(Integer, nullable=True, default=90)   # dBm (approx 0-100)
    temperature = Column(Float, nullable=True)                     # Celsius
    status = Column(String(20), nullable=False, default=BinStatus.ACTIVE)
    last_updated = Column(DateTime, nullable=True)
    last_collection_time = Column(DateTime, nullable=True)
    installation_date = Column(Date, nullable=False)

    # Relationships
    history = relationship("FillHistory", back_populates="bin", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="bin", cascade="all, delete-orphan")
    collection_requests = relationship("CollectionRequest", back_populates="bin", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="bin", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
#  FILL HISTORY
# ─────────────────────────────────────────────────────────────

class FillHistory(Base):
    """
    Time-series log of every IoT sensor reading.
    Each ESP32 push creates one record here.
    Used for ML training and trend visualization.
    """
    __tablename__ = 'fill_history'

    history_id = Column(Integer, primary_key=True, autoincrement=True)
    bin_id = Column(String(50), ForeignKey('bins.bin_id'), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    fill_percentage = Column(Float, nullable=False)        # 0 to 100
    battery = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)             # Celsius
    rainfall = Column(Float, nullable=True)                # mm
    holiday = Column(Integer, nullable=False, default=0)   # 0 or 1
    population_density = Column(Float, nullable=True)
    waste_generated = Column(Float, nullable=True)         # liters added this hour

    # Relationships
    bin = relationship("Bin", back_populates="history")


# ─────────────────────────────────────────────────────────────
#  PREDICTIONS
# ─────────────────────────────────────────────────────────────

class Prediction(Base):
    """
    ML model output — 24-hour fill level forecast per bin.
    Refreshed on demand via POST /api/predict.
    """
    __tablename__ = 'predictions'

    prediction_id = Column(Integer, primary_key=True, autoincrement=True)
    bin_id = Column(String(50), ForeignKey('bins.bin_id'), nullable=False, index=True)
    prediction_time = Column(DateTime, nullable=False, index=True)    # Target timestamp (T+24h)
    predicted_fill = Column(Float, nullable=False)                    # Predicted fill %
    overflow_probability = Column(Float, nullable=False)              # 0 to 1
    model_version = Column(String(50), nullable=True, default="xgboost_v1")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    bin = relationship("Bin", back_populates="predictions")


# ─────────────────────────────────────────────────────────────
#  COLLECTION REQUESTS
# ─────────────────────────────────────────────────────────────

class CollectionRequest(Base):
    """
    Auto-generated when a bin exceeds 80% fill.
    Queued for inclusion in the next route optimization.
    """
    __tablename__ = 'collection_requests'

    request_id = Column(Integer, primary_key=True, autoincrement=True)
    bin_id = Column(String(50), ForeignKey('bins.bin_id'), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    fill_at_request = Column(Float, nullable=False)        # Fill % when request was created
    status = Column(String(20), nullable=False, default="Pending")   # Pending, Assigned, Collected
    assigned_truck_id = Column(String(50), nullable=True)
    collected_at = Column(DateTime, nullable=True)

    # Relationships
    bin = relationship("Bin", back_populates="collection_requests")


# ─────────────────────────────────────────────────────────────
#  DRIVERS
# ─────────────────────────────────────────────────────────────

class Driver(Base):
    """
    Municipal truck drivers.
    """
    __tablename__ = 'drivers'

    driver_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    license_number = Column(String(50), nullable=True)
    status = Column(String(20), nullable=False, default="Available")
    language = Column(String(10), nullable=False, default="en")

    # Relationships
    trucks = relationship("Truck", back_populates="driver_obj")


# ─────────────────────────────────────────────────────────────
#  TRUCKS
# ─────────────────────────────────────────────────────────────

class Truck(Base):
    """
    Municipal collection truck fleet.
    """
    __tablename__ = 'trucks'

    truck_id = Column(String(50), primary_key=True)
    plate_number = Column(String(20), nullable=True)
    capacity = Column(Float, nullable=False)               # in liters
    status = Column(String(20), nullable=False, default=TruckStatus.IDLE)
    driver = Column(String(100), nullable=False)           # Driver name (denormalized for speed)
    driver_id = Column(String(50), ForeignKey('drivers.driver_id'), nullable=True)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    city = Column(String(100), nullable=False, default="Hyderabad")

    # Relationships
    driver_obj = relationship("Driver", back_populates="trucks")
    routes = relationship("OptimizedRoute", back_populates="truck", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
#  OPTIMIZED ROUTES
# ─────────────────────────────────────────────────────────────

class OptimizedRoute(Base):
    """
    Daily optimized collection route computed by OR-Tools CVRP solver.
    """
    __tablename__ = 'optimized_routes'

    route_id = Column(Integer, primary_key=True, autoincrement=True)
    truck_id = Column(String(50), ForeignKey('trucks.truck_id'), nullable=False)
    date = Column(Date, nullable=False, index=True)
    distance = Column(Float, nullable=False)               # km
    fuel = Column(Float, nullable=False)                   # liters
    duration = Column(Float, nullable=False)               # hours
    route_path = Column(Text, nullable=False)              # JSON: [{bin_id, lat, lon, load}]
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    truck = relationship("Truck", back_populates="routes")
    stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
#  ROUTE STOPS
# ─────────────────────────────────────────────────────────────

class RouteStop(Base):
    """
    Individual stops in a route — one row per bin collected per route.
    """
    __tablename__ = 'route_stops'

    stop_id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(Integer, ForeignKey('optimized_routes.route_id'), nullable=False, index=True)
    bin_id = Column(String(50), nullable=False)
    stop_order = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    load_collected = Column(Float, nullable=True)          # liters collected at stop
    arrived_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    route = relationship("OptimizedRoute", back_populates="stops")


# ─────────────────────────────────────────────────────────────
#  NOTIFICATIONS
# ─────────────────────────────────────────────────────────────

class Notification(Base):
    """
    Auto-generated alerts when bins exceed 80% fill.
    Also used for system-level messages.
    """
    __tablename__ = 'notifications'

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    bin_id = Column(String(50), ForeignKey('bins.bin_id'), nullable=True)
    severity = Column(String(20), nullable=False, default=NotificationSeverity.WARNING)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    bin = relationship("Bin", back_populates="notifications")


# ─────────────────────────────────────────────────────────────
#  USERS (for JWT Auth)
# ─────────────────────────────────────────────────────────────

class User(Base):
    """
    Municipal system users with role-based access control.
    """
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="operator")   # admin, operator, viewer
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    language = Column(String(10), nullable=False, default="en")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


# ─────────────────────────────────────────────────────────────
#  MAINTENANCE WORKERS
# ─────────────────────────────────────────────────────────────

class MaintenanceWorker(Base):
    """
    Municipal maintenance and field repair workers.
    Can log in to the maintenance portal to view/fix reported bin issues.
    """
    __tablename__ = 'maintenance_workers'

    worker_id = Column(String(50), primary_key=True)         # e.g. MNT001
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    zone = Column(String(100), nullable=True)                # Assigned zone/area
    city = Column(String(50), nullable=True, default="Hyderabad") # Assigned city
    status = Column(String(20), nullable=False, default="Available")  # Available, On Job, Off Duty
    is_active = Column(Boolean, nullable=False, default=True)
    language = Column(String(10), nullable=False, default="en")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    logs = relationship("MaintenanceLog", back_populates="worker", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
#  MAINTENANCE LOGS
# ─────────────────────────────────────────────────────────────

class MaintenanceLog(Base):
    """
    Records every maintenance event for a bin.
    Created when a driver reports an issue; resolved by maintenance worker.
    """
    __tablename__ = 'maintenance_logs'

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    bin_id = Column(String(50), ForeignKey('bins.bin_id'), nullable=False, index=True)
    worker_id = Column(String(50), ForeignKey('maintenance_workers.worker_id'), nullable=True)
    issue_type = Column(String(100), nullable=False)         # Overflow, Damage, Sensor Fault, etc.
    notes = Column(Text, nullable=True)
    reported_by = Column(String(50), nullable=True)          # truck_id of driver who reported
    status = Column(String(30), nullable=False, default="Open")  # Open, In Progress, Resolved
    priority = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    reported_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    assigned_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Relationships
    worker = relationship("MaintenanceWorker", back_populates="logs")


# ─────────────────────────────────────────────────────────────
#  QR CODES (Smart Identity)
# ─────────────────────────────────────────────────────────────

class QRCode(Base):
    """
    Centralized mapping of QR tokens to system entities (Drivers, Workers, Trucks, Bins).
    Provides secure session generation and asset tracking without exposing raw IDs.
    """
    __tablename__ = 'qr_codes'

    qr_id = Column(String(50), primary_key=True)             # Unique internal ID
    entity_type = Column(String(50), nullable=False)         # Driver, Worker, Truck, Bin
    entity_id = Column(String(50), nullable=False, index=True) # ID of the actual entity
    token = Column(String(255), unique=True, nullable=False, index=True) # The hashed string inside the physical QR
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


# ─────────────────────────────────────────────────────────────
#  AI WASTE CLASSIFICATION LOGS
# ─────────────────────────────────────────────────────────────

class WasteClassificationLog(Base):
    """
    Logs every image processed through the YOLOv8 AI waste classifier.
    Stores bounding boxes, confidence, detected material category, and suggested action.
    """
    __tablename__ = 'waste_classification_logs'

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    image_filename = Column(String(255), nullable=True)
    detected_class = Column(String(50), nullable=False)      # plastic, metal, glass, e_waste, etc.
    confidence = Column(Float, nullable=False)               # 0.0 to 1.0
    bounding_boxes = Column(Text, nullable=True)             # JSON string of detections [{class, conf, bbox}]
    category = Column(String(50), nullable=False)            # Recyclable, Organic, Hazardous, E-Waste
    bin_type_assigned = Column(String(50), nullable=False)   # Blue (Dry), Green (Wet), Red (Hazardous/E-Waste)
    disposal_instructions = Column(Text, nullable=True)
    estimated_weight_kg = Column(Float, nullable=True, default=0.2)
    co2_saved_kg = Column(Float, nullable=True, default=0.0)
    user_feedback = Column(String(20), nullable=True)        # correct, incorrect


# ─────────────────────────────────────────────────────────────
#  CIRCULAR ECONOMY & RECYCLING FACILITIES
# ─────────────────────────────────────────────────────────────

class RecyclingCenter(Base):
    """
    Municipal recycling & material recovery facilities (MRFs).
    Tracks material processing rates, circular economy conversion, and revenue generated.
    """
    __tablename__ = 'recycling_centers'

    center_id = Column(String(50), primary_key=True)         # e.g. REC001
    name = Column(String(100), nullable=False)
    facility_type = Column(String(50), nullable=False)       # MRF, Composting, E-Waste Refurbisher, Plastic Pyrolysis
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, default="Hyderabad")
    daily_capacity_tons = Column(Float, nullable=False, default=50.0)
    current_utilization = Column(Float, nullable=False, default=65.0)  # %
    contact_phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class MaterialRecoveryLog(Base):
    """
    Material batches diverted from landfill into the circular economy.
    Tracks recovered materials (PET, aluminum, compost, rare metals) and value created.
    """
    __tablename__ = 'material_recovery_logs'

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    center_id = Column(String(50), ForeignKey('recycling_centers.center_id'), nullable=False, index=True)
    material_type = Column(String(50), nullable=False)       # Plastic-PET, Plastic-HDPE, Aluminum, Copper, Compost, Glass
    category = Column(String(50), nullable=False)            # Recyclable, Organic, E-Waste
    weight_kg = Column(Float, nullable=False)
    co2_offset_kg = Column(Float, nullable=False)
    revenue_generated_inr = Column(Float, nullable=False)
    date_processed = Column(Date, nullable=False, default=datetime.utcnow)
    buyer_industry = Column(String(100), nullable=True)      # Textile, Packaging, Agriculture, Metallurgy


# ─────────────────────────────────────────────────────────────
#  CITIZEN E-WASTE & ILLEGAL DUMPING REPORTS
# ─────────────────────────────────────────────────────────────

class CitizenReport(Base):
    """
    Crowdsourced reporting from citizens for overflowing bins, illegal dumping,
    and special scheduled E-Waste doorstep pickup requests.
    """
    __tablename__ = 'citizen_reports'

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    report_type = Column(String(50), nullable=False)         # e_waste_pickup, illegal_dumping, overflow, damaged_bin
    citizen_name = Column(String(100), nullable=True)
    citizen_phone = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, default="Hyderabad")
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    ai_classification = Column(String(100), nullable=True)
    status = Column(String(30), nullable=False, default="Pending") # Pending, Scheduled, Dispatched, Resolved
    reward_points_awarded = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

