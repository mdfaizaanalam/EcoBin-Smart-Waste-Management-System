export type WasteType = 'organic' | 'recyclable' | 'hazardous' | 'e-waste' | 'general';
export type BinStatus = 'normal' | 'medium' | 'warning' | 'critical' | 'fire_alert' | 'maintenance';
export type CityId = 'hyderabad' | 'bengaluru' | 'mumbai' | 'delhi' | 'chennai' | 'pune' | 'kolkata' | 'ahmedabad' | 'All';

export interface LocationCoords {
  lat: number;
  lng: number;
  address: string;
  zone: string;
}

export interface SmartBinTelemetry {
  id: string;
  binCode: string;
  name: string;
  city?: CityId;
  wasteType: WasteType;
  location: LocationCoords;
  fillLevel: number;
  weightKg: number;
  capacityKg: number;
  temperature: number;
  batteryPercent: number;
  solarCharging: boolean;
  gasLevelPpm: number;
  lidLocked: boolean;
  status: BinStatus;
  lastEmptied: string;
  lastTelemetryUpdate: string;
  collectionPriority: number;
  qrCode: string;
  hardwareSpecs: {
    microcontroller: string;
    ultrasonicSensor: string;
    loadCell: string;
    gasSensor: string;
    connectivity: string;
    solarPanelWatts: number;
  };
}

export interface WasteClassificationResult {
  id: string;
  itemName: string;
  wasteCategory: WasteType;
  confidence: number;
  recommendedBinColor: string;
  materialComposition: string;
  decompositionTime: string;
  carbonOffsetKg: number;
  recyclingInstructions: string[];
  ecoPointsEarned: number;
  hazardWarning?: string;
  timestamp: string;
  imageUrl?: string;
}

export interface AICircularMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  lcaBadge?: {
    material: string;
    co2OffsetKg: number;
    destination: string;
  };
}

export interface CircularCommodity {
  id: string;
  city?: CityId;
  name: string;
  materialCode: string;
  wasteType: WasteType;
  currentPricePerKg: number;
  verifiedOfftaker: string;
  stockAvailableKg: number;
  co2DisplacementFactor: number;
  endProductDescription: string;
  demandTrend: 'surging' | 'stable' | 'high';
}

export interface CircularManifest {
  id: string;
  manifestCode: string;
  commodityId: string;
  commodityName: string;
  weightKg: number;
  totalRevenueInr: number;
  co2AvoidedKg: number;
  offtaker: string;
  batchQrCode: string;
  timestamp: string;
  status: 'certified' | 'in_transit' | 'processed';
}

export interface CivicBlackSpot {
  id: string;
  city: CityId;
  title: string;
  location: LocationCoords;
  reportedBy: string;
  reportedAt: string;
  severity: 'low' | 'moderate' | 'critical';
  estimatedVolumeM3: number;
  wasteComposition: string[];
  drainBlockageRisk: boolean;
  status: 'reported' | 'crew_dispatched' | 'cleared' | 'verified';
  assignedCrew?: string;
  photoUrl: string;
  clearedAt?: string;
  clearedProofUrl?: string;
  divertedWeightKg?: number;
  citizenRewardPoints: number;
}

export interface BiomethanationEnergyMetric {
  city: CityId;
  plantName: string;
  dailyOrganicInputTonnes: number;
  bioCngProducedKg: number;
  gridPowerFedMwh: number;
  slurryFertilizerOutputTonnes: number;
  flareReductionPercent: number;
  co2eAvoidedTonnes: number;
}

export interface CitizenReward {
  id: string;
  title: string;
  pointsRequired: number;
  category: 'transit' | 'energy_bill' | 'compost' | 'store';
  discountValue: string;
  sponsor: string;
  icon: string;
  description: string;
  redeemedCount: number;
}

export interface CitizenProfile {
  id: string;
  name: string;
  email: string;
  ecoPoints: number;
  recycledKg: number;
  co2AvoidedKg: number;
  depositsCount: number;
  rankTitle: string;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    dateEarned: string;
  }>;
  recentDeposits: Array<{
    id: string;
    binCode: string;
    wasteType: WasteType;
    weightKg: number;
    points: number;
    timestamp: string;
  }>;
}

export interface CitizenReport {
  id: string;
  citizenName: string;
  binCode: string;
  issueType: 'overflowing' | 'damaged_lid' | 'foul_odor' | 'fire_smoke' | 'illegal_dumping';
  photoUrl?: string;
  description: string;
  location: string;
  status: 'open' | 'investigating' | 'resolved';
  timestamp: string;
}

export interface WardScorecard {
  wardNumber: number;
  city?: CityId;
  wardName: string;
  zone: string;
  cleanlinessScore: number;
  segregationCompliancePercent: number;
  activeSmartBins: number;
  monthlyWasteDivertedTonnes: number;
  averageResponseMinutes: number;
  rank: number;
}

export interface ESGAuditReport {
  reportingPeriod: string;
  organization: string;
  scope1DieselAvoidedLitres: number;
  scope1Co2AvoidedTonnes: number;
  scope3LandfillMethaneAvoidedTonnes: number;
  circularRecycledTonnes: number;
  totalEconomicPreservationInr: number;
  auditHash: string;
  generatedDate: string;
}

export interface FoodWasteBatch {
  id: string;
  source: string;
  category: 'produce' | 'dairy' | 'cooked_meal' | 'bakery' | 'organic_scrap';
  weightKg: number;
  spoilageIndex: number;
  methanePotentialM3: number;
  action: 'composting' | 'biomethanation' | 'animal_feed' | 'food_bank';
  timestamp: string;
  status: 'routed' | 'processing' | 'converted';
}

export interface ReusableItem {
  id: string;
  title: string;
  category: 'electronics' | 'appliances' | 'furniture' | 'tools' | 'textiles';
  condition: 'like_new' | 'good' | 'needs_minor_repair' | 'for_parts';
  estimatedCo2SavedKg: number;
  originalValueInr: number;
  depotPriceInr: number;
  location: string;
  repairGuideAvailable: boolean;
  status: 'available' | 'reserved' | 'refurbished' | 'claimed';
  donorName: string;
}

export interface RepairGuide {
  id: string;
  deviceModel: string;
  commonFault: string;
  difficulty: 'easy' | 'moderate' | 'expert';
  timeMins: number;
  spareParts: string[];
  toolsNeeded: string[];
  steps: string[];
  rightToRepairScore: number;
}
