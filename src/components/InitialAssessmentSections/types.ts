export interface BabyIdentifiers {
    babyName: string;
    uhid: string;
    ipAdmissionNo: string;
    bedNumber: string;
    sex: 'Male' | 'Female' | 'Ambiguous';
    dateOfBirth: string; // ISO string
    timeOfBirth: string; // HH:mm
    placeOfBirth: 'Inborn' | 'Outborn - Other Hospital' | 'Outborn - Home/Other';
    modeOfDelivery: 'Normal Vaginal' | 'Assisted Vaginal' | 'Elective LSCS' | 'Emergency LSCS' | 'Other';
    referringHospital?: string; // Conditional
    transportDetails?: string; // Conditional
}

export interface MaternalDetails {
    motherName: string;
    motherAge: string;
    gravida: string;
    para: string;
    living: string;
    abortion: string;
    gestationalAgeWeeks: string;
    gestationalAgeDays: string;
    gaAssessmentMethod: 'LMP' | 'Early USG' | 'Ballard Score' | 'Clinical Estimate';
    highRiskFactors: string[];
    otherRiskFactors?: string;
    antepartumComplications: string;
    intrapartumComplications: string;
    medicationsInPregnancy: string[];
    otherMedications?: string;
    maternalInfections: string[];
    otherInfections?: string;
}

export interface BirthDetails {
    birthWeight: string; // grams
    length: string; // cm
    headCircumference: string; // cm
    chestCircumference?: string; // cm
    apgar1min: string;
    apgar5min: string;
    apgar10min: string;
    resuscitationRequired: boolean;
    resuscitationSteps?: string[];
    otherResuscitation?: string;
    criedAtBirth: boolean;
    delayedCordClamping: 'Yes' | 'No' | 'Not Known';
    meconiumStainedLiquor: 'Yes' | 'No' | 'Not Known';
}

export interface TransportDetails {
    ageAtAdmission: string; // hours
    transportMode: 'Ambulance' | 'Private Vehicle' | 'Other';
    accompaniedBy: string[];
    preNicuInterventions: string[];
    conditionOnArrival: string[];
    otherCondition?: string;
}

export interface PresentingProblems {
    chiefComplaints: string[];
    otherComplaints?: string;
    onsetDuration: string;
    riskCategory: 'Stable' | 'Moderate Risk' | 'Critical';
    provisionalDiagnosis: string;
}

export interface AdmissionVitals {
    weight: string;
    temp: string;
    heartRate: string;
    respiratoryRate: string;
    spo2: string;
    bpSystolic: string;
    bpDiastolic: string;
    bloodGlucose: string;
    painScore: string;
}

export interface SystemicExam {
    generalAppearance: 'Active' | 'Lethargic' | 'Hypotonic' | 'Irritable' | 'Comatose';
    tone: 'Normal' | 'Hypotonic' | 'Hypertonic';
    levelOfConsciousness: 'Alert' | 'Drowsy' | 'Stuporous' | 'Coma';
    primitiveReflexes: {
        suck: 'Normal' | 'Depressed' | 'Absent';
        moro: 'Normal' | 'Depressed' | 'Absent';
        rooting: 'Normal' | 'Depressed' | 'Absent';
        grasp: 'Normal' | 'Depressed' | 'Absent';
    };
    seizures: boolean;
    seizureDescription?: string;
    fontanelle: 'Normal' | 'Bulging' | 'Sunken' | 'Other';
    fontanelleOther?: string;

    // Respiratory
    workOfBreathing: string[];
    silvermanScore?: string;
    airEntry: 'Bilateral Equal' | 'Decreased' | 'Asymmetrical';
    addedSounds: string[];

    // Cardio
    color: 'Pink' | 'Pale' | 'Cyanosed' | 'Mottled';
    capillaryRefillTime: string;
    heartSounds: string;
    murmur: boolean;
    murmurDescription?: string;
    pulses: 'Normal' | 'Weak' | 'Bounding';
    pulseDescription?: string;

    // GI
    abdominalDistension: boolean;
    liverSpleenPalpable: boolean;
    liverSpleenSize?: string;
    bowelSounds: 'Present' | 'Absent' | 'Hyperactive';
    feedingTolerance: 'NPO' | 'Tolerating' | 'Vomiting' | 'Abdominal Distension';

    // Skin/Other
    skinFindings: string[];
    otherSkin?: string;
    congenitalAnomalies: string;
    extremitiesTemp: 'Warm' | 'Cold';
}

export interface Investigations {
    baselineLabs: string[];
    otherLabs?: string;
    resultsSummary: string; // Placeholder for now
    radiologyOrdered: string[];
    otherRadiology?: string;
    sepsisScreen: 'Not Done' | 'Sent' | 'Positive' | 'Negative';
}

export interface ManagementPlan {
    respiratorySupport: string[];
    otherRespiratory?: string;
    ivFluids: boolean;
    ivFluidsDetails?: string;
    inotropes: string[];
    antibiotics: boolean;
    antibioticsRegimen?: string;
    otherMedications: string;
    feedingPlan: string[];
    feedingRoute: string;
    feedingFrequencyVolume: string;
    monitoringPlan: string[];
    otherMonitoring?: string;
    procedures: string[];
    procedureDescription?: string;
}

export interface RiskCounselling {
    prognosis: 'Good' | 'Guarded' | 'Poor';
    counselled: boolean;
    counsellingSummary?: string;
    medicoLegalNotes: string;
    additionalNotes: string;
}

export interface SignOff {
    admittingDoctor: string;
    designation: string;
    dateOfAssessment: string; // ISO
    timeOfAssessment: string;
    coSigningConsultant?: string;
    isComplete: boolean;
}

export interface InitialAssessmentForm {
    baby_identifiers: BabyIdentifiers;
    maternal_pregnancy: MaternalDetails;
    birth_resuscitation: BirthDetails;
    transport_pre_nicu?: TransportDetails;
    presenting_problems: PresentingProblems;
    admission_vitals: AdmissionVitals;
    system_exam: SystemicExam;
    investigations: Investigations;
    initial_management: ManagementPlan;
    risk_counselling: RiskCounselling;
    signoff_meta: SignOff;
}
