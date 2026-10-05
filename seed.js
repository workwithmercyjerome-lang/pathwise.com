import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const careers = [
  {
    "id": "1",
    "name": "Software Engineering",
    "category": "Technology",
    "description": "Design and build the apps and systems people use every day.",
    "skills": [
      "Problem solving",
      "JavaScript",
      "Git & GitHub"
    ],
    "educationPathway": "BSc Computer Science, or a bootcamp plus a strong portfolio",
    "qualifications": "Mathematics, English, Physics or ICT",
    "relatedJobRoles": [
      "Frontend Developer",
      "Backend Developer",
      "QA Engineer"
    ],
    "industries": [
      "Fintech",
      "Telecoms",
      "E-commerce"
    ],
    "tags": [
      "tech",
      "problem",
      "build"
    ]
  },
  {
    "id": "2",
    "name": "Data Analysis",
    "category": "Technology",
    "description": "Turn raw numbers into answers that help organisations decide.",
    "skills": [
      "Excel",
      "SQL",
      "Critical thinking"
    ],
    "educationPathway": "BSc in Statistics, Maths, Economics or similar",
    "qualifications": "Mathematics, Economics, ICT",
    "relatedJobRoles": [
      "Data Analyst",
      "BI Analyst"
    ],
    "industries": [
      "Banking",
      "Health",
      "Government"
    ],
    "tags": [
      "tech",
      "problem",
      "numbers"
    ]
  },
  {
    "id": "3",
    "name": "Medicine",
    "category": "Health",
    "description": "Diagnose illness and care for patients across their lifetime.",
    "skills": [
      "Empathy",
      "Biology",
      "Decision making"
    ],
    "educationPathway": "MBBS or MBChB, then housemanship and specialisation",
    "qualifications": "Biology, Chemistry, Physics, Mathematics",
    "relatedJobRoles": [
      "Medical Doctor",
      "Surgeon"
    ],
    "industries": [
      "Hospitals",
      "Public health",
      "Research"
    ],
    "tags": [
      "people",
      "science",
      "help"
    ]
  },
  {
    "id": "4",
    "name": "Architecture",
    "category": "Engineering",
    "description": "Shape buildings and spaces that are useful and beautiful.",
    "skills": [
      "Drawing",
      "3D modelling",
      "Creativity"
    ],
    "educationPathway": "BSc Architecture plus Master's for registration",
    "qualifications": "Mathematics, Physics, Fine Art",
    "relatedJobRoles": [
      "Architect",
      "Urban Designer"
    ],
    "industries": [
      "Construction",
      "Real estate"
    ],
    "tags": [
      "creative",
      "build",
      "problem"
    ]
  },
  {
    "id": "5",
    "name": "Digital Marketing",
    "category": "Business",
    "description": "Help brands reach and grow audiences online.",
    "skills": [
      "Storytelling",
      "Social media",
      "Analytics"
    ],
    "educationPathway": "Degree in Marketing or Communication, or certified short courses",
    "qualifications": "English, Economics, Business Studies",
    "relatedJobRoles": [
      "Social Media Manager",
      "SEO Specialist"
    ],
    "industries": [
      "Retail",
      "Media",
      "Startups"
    ],
    "tags": [
      "creative",
      "people",
      "business"
    ]
  },
  {
    "id": "6",
    "name": "Product Management",
    "category": "Business",
    "description": "Decide what gets built, for whom, and why.",
    "skills": [
      "Communication",
      "User research",
      "Prioritisation"
    ],
    "educationPathway": "Any degree, plus experience in tech, design or business",
    "qualifications": "English, Mathematics, Economics",
    "relatedJobRoles": [
      "Associate PM",
      "Product Owner"
    ],
    "industries": [
      "Technology",
      "Fintech",
      "Consulting"
    ],
    "tags": [
      "tech",
      "business",
      "people",
      "problem"
    ]
  },
  {
    "id": "7",
    "name": "Law",
    "category": "Law",
    "description": "Advise, represent and argue for people and organisations.",
    "skills": [
      "Research",
      "Public speaking",
      "Writing"
    ],
    "educationPathway": "LLB, then Law School and call to the Bar",
    "qualifications": "English, Literature, Government, History",
    "relatedJobRoles": [
      "Lawyer",
      "Legal Adviser"
    ],
    "industries": [
      "Courts",
      "Corporate",
      "NGOs"
    ],
    "tags": [
      "people",
      "help",
      "words"
    ]
  },
  {
    "id": "8",
    "name": "Graphic Design",
    "category": "Creative Arts",
    "description": "Communicate ideas through image, type and layout.",
    "skills": [
      "Typography",
      "Figma",
      "Creativity"
    ],
    "educationPathway": "Diploma or degree in design, or a self-taught portfolio",
    "qualifications": "Fine Art, Technical Drawing, ICT",
    "relatedJobRoles": [
      "Brand Designer",
      "UI Designer"
    ],
    "industries": [
      "Advertising",
      "Media",
      "Tech"
    ],
    "tags": [
      "creative",
      "tech",
      "words"
    ]
  },
  {
    "id": "9",
    "name": "Electrical Engineering",
    "category": "Engineering",
    "description": "Design, build and maintain power, electronics and control systems.",
    "skills": [
      "Circuit analysis",
      "Mathematics",
      "Problem solving"
    ],
    "educationPathway": "BEng or BSc Electrical/Electronic Engineering, then professional registration",
    "qualifications": "Mathematics, Physics, Chemistry, English",
    "relatedJobRoles": [
      "Electrical Engineer",
      "Power Systems Engineer",
      "Control Engineer"
    ],
    "industries": [
      "Power",
      "Telecoms",
      "Manufacturing"
    ],
    "tags": [
      "build",
      "numbers",
      "tech"
    ]
  },
  {
    "id": "10",
    "name": "Civil Engineering",
    "category": "Engineering",
    "description": "Plan and build roads, bridges, water systems and buildings.",
    "skills": [
      "Structural analysis",
      "Mathematics",
      "Project management"
    ],
    "educationPathway": "BEng or BSc Civil Engineering, then professional registration",
    "qualifications": "Mathematics, Physics, Chemistry, English",
    "relatedJobRoles": [
      "Civil Engineer",
      "Site Engineer",
      "Structural Engineer"
    ],
    "industries": [
      "Construction",
      "Government",
      "Infrastructure"
    ],
    "tags": [
      "build",
      "numbers"
    ]
  },
  {
    "id": "11",
    "name": "Agriculture",
    "category": "Agriculture",
    "description": "Grow food and manage land, crops, livestock and agribusiness.",
    "skills": [
      "Crop and soil science",
      "Farm management",
      "Agribusiness"
    ],
    "educationPathway": "BSc Agriculture or Agricultural Science, or practical training plus short courses",
    "qualifications": "Biology, Chemistry, Mathematics, Agricultural Science",
    "relatedJobRoles": [
      "Agronomist",
      "Farm Manager",
      "Agribusiness Officer"
    ],
    "industries": [
      "Farming",
      "Food processing",
      "Research"
    ],
    "tags": [
      "science",
      "build",
      "business"
    ]
  },
  {
    "id": "12",
    "name": "Nursing",
    "category": "Health",
    "description": "Care for patients and support doctors in hospitals and communities.",
    "skills": [
      "Patient care",
      "Communication",
      "Biology"
    ],
    "educationPathway": "BNSc or nursing school diploma, then registration with the nursing council",
    "qualifications": "Biology, Chemistry, Physics, English",
    "relatedJobRoles": [
      "Registered Nurse",
      "Midwife",
      "Community Health Nurse"
    ],
    "industries": [
      "Hospitals",
      "Public health",
      "Clinics"
    ],
    "tags": [
      "people",
      "science",
      "help"
    ]
  },
  {
    "id": "13",
    "name": "Pharmacy",
    "category": "Health",
    "description": "Prepare medicines, advise patients and ensure safe drug use.",
    "skills": [
      "Chemistry",
      "Attention to detail",
      "Patient advice"
    ],
    "educationPathway": "BPharm or PharmD, then internship and registration",
    "qualifications": "Chemistry, Biology, Physics, Mathematics",
    "relatedJobRoles": [
      "Pharmacist",
      "Hospital Pharmacist",
      "Regulatory Officer"
    ],
    "industries": [
      "Pharmacies",
      "Hospitals",
      "Pharmaceuticals"
    ],
    "tags": [
      "science",
      "people",
      "numbers"
    ]
  },
  {
    "id": "14",
    "name": "Accounting",
    "category": "Business",
    "description": "Track, audit and plan money for people and organisations.",
    "skills": [
      "Bookkeeping",
      "Excel",
      "Ethics"
    ],
    "educationPathway": "BSc Accounting, then professional exams (ICAN, ANAN or ICAG)",
    "qualifications": "Mathematics, English, Economics, Accounting",
    "relatedJobRoles": [
      "Accountant",
      "Auditor",
      "Tax Analyst"
    ],
    "industries": [
      "Banking",
      "Government",
      "Consulting"
    ],
    "tags": [
      "numbers",
      "business"
    ]
  }
];

for (const c of careers) {
  const data = {
    title: c.name,
    description: c.description,
    category: c.category,
    industries: c.industries.join(","),
    detailsJson: JSON.stringify(c)
  };
  await prisma.career.upsert({ where: { title: c.name }, update: data, create: data });
}

console.log(`Seeded ${careers.length} PathWise careers.`);
await prisma.$disconnect();
