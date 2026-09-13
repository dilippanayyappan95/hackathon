// GovProof Demo Data 
// Fictional demonstration organizations and data for the platform.

export const DEPARTMENTS = [
    "Maharashtra Urban Innovation Department",
    "Maharashtra Health Innovation Department",
    "Maharashtra Education Innovation Department",
    "Maharashtra Water & Infrastructure Department"
];

export const STARTUPS = [
    { id: 'st_1', name: "EcoGrid Innovations", domain: "Smart City", matchScore: 94 },
    { id: 'st_2', name: "MedFlow AI", domain: "Healthcare", matchScore: 89 },
    { id: 'st_3', name: "CivicPulse Technologies", domain: "Governance", matchScore: 84 },
    { id: 'st_4', name: "WaterSense Labs", domain: "Infrastructure", matchScore: 91 },
    { id: 'st_5', name: "AgriVision Systems", domain: "Agriculture", matchScore: 78 },
    { id: 'st_6', name: "SafeRoute Mobility", domain: "Transport", matchScore: 86 },
    { id: 'st_7', name: "EduBridge Labs", domain: "Education", matchScore: 92 },
    { id: 'st_8', name: "WasteZero Technologies", domain: "Waste Management", matchScore: 99 },
    { id: 'st_9', name: "EnergyLens AI", domain: "Power", matchScore: 88 },
    { id: 'st_10', name: "InfraWatch Systems", domain: "Smart City", matchScore: 87 }
];

export const CHALLENGES = [
    {
        id: 'ch_1',
        title: "Smart Waste Collection Optimization",
        department: DEPARTMENTS[0],
        domain: "Waste Management",
        target: "20% operational cost reduction",
        budget: "₹25,00,000",
        deadline: "2026-10-15",
        status: "Active",
        nextAction: "Review Applications",
        applicationsCount: 14
    },
    {
        id: 'ch_2',
        title: "Hospital Waiting Time Reduction",
        department: DEPARTMENTS[1],
        domain: "Healthcare",
        target: "40% waiting-time reduction",
        budget: "₹40,00,000",
        deadline: "2026-10-01",
        status: "Evaluation",
        nextAction: "Expert Review Pending",
        applicationsCount: 8
    },
    {
        id: 'ch_3',
        title: "Water Leakage Detection",
        department: DEPARTMENTS[3],
        domain: "Infrastructure",
        target: "25% reduction in water loss",
        budget: "₹15,00,000",
        deadline: "2026-11-20",
        status: "Draft",
        nextAction: "Publish Challenge",
        applicationsCount: 0
    },
    {
        id: 'ch_4',
        title: "School Attendance Improvement",
        department: DEPARTMENTS[2],
        domain: "Education",
        target: "15% improvement",
        budget: "₹10,00,000",
        deadline: "2026-09-30",
        status: "Active",
        nextAction: "Review Applications",
        applicationsCount: 22
    },
    {
        id: 'ch_5',
        title: "Road Maintenance Prediction",
        department: DEPARTMENTS[0],
        domain: "Infrastructure",
        target: "30% faster response",
        budget: "₹35,00,000",
        deadline: "2026-08-15",
        status: "Completed",
        nextAction: "Validate Final Report",
        applicationsCount: 5
    },
    {
        id: 'ch_6',
        title: "Citizen Grievance Classification",
        department: DEPARTMENTS[0],
        domain: "Governance",
        target: "50% reduction in manual classification time",
        budget: "₹12,00,000",
        deadline: "2026-12-01",
        status: "Draft",
        nextAction: "Publish Challenge",
        applicationsCount: 0
    }
];

export const PILOTS = [
    {
        id: 'MH-WASTE-2026-001',
        title: "Smart Waste Management",
        startup: "WasteZero Technologies",
        department: DEPARTMENTS[0],
        location: "Pune, Zone 4",
        baseline: "₹12L/month",
        target: "20% reduction",
        actual: "27%",
        status: "Verified",
        scaleReadiness: 91,
        recommendation: "SCALE",
        color: "emerald"
    },
    {
        id: 'MH-HEALTH-2026-042',
        title: "Hospital Queue Management",
        startup: "MedFlow AI",
        department: DEPARTMENTS[1],
        location: "Mumbai General",
        baseline: "135 minutes",
        target: "60 minutes",
        actual: "78 minutes",
        status: "Under Review",
        scaleReadiness: 65,
        recommendation: "EXTEND PILOT",
        color: "amber"
    },
    {
        id: 'MH-INFRA-2026-018',
        title: "Road Maintenance Prediction",
        startup: "InfraWatch Systems",
        department: DEPARTMENTS[3],
        location: "Thane District",
        baseline: "14 days",
        target: "30% improvement",
        actual: "11%",
        status: "Failed",
        scaleReadiness: 24,
        recommendation: "DO NOT SCALE",
        color: "red"
    }
];
