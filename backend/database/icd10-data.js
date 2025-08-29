// ICD-10 Database for Common Medical Conditions
// This file contains a comprehensive list of ICD-10 codes for automatic reflection in E-Prescriptions

const icd10Data = [
  // Infectious Diseases
  {
    code: 'A09',
    description: 'Infectious gastroenteritis and colitis, unspecified',
    category: 'Infectious Diseases',
    commonNames: ['Gastroenteritis', 'Stomach flu', 'Food poisoning', 'Diarrhea']
  },
  {
    code: 'A15.9',
    description: 'Respiratory tuberculosis unspecified, bacteriologically and histologically negative',
    category: 'Infectious Diseases',
    commonNames: ['Tuberculosis', 'TB', 'Pulmonary TB']
  },
  {
    code: 'A41.9',
    description: 'Sepsis, unspecified organism',
    category: 'Infectious Diseases',
    commonNames: ['Sepsis', 'Blood infection', 'Systemic infection']
  },

  // Neoplasms (Cancers)
  {
    code: 'C34.90',
    description: 'Unspecified malignant neoplasm of unspecified bronchus or lung',
    category: 'Neoplasms',
    commonNames: ['Lung cancer', 'Bronchial cancer', 'Pulmonary malignancy']
  },
  {
    code: 'C50.919',
    description: 'Unspecified malignant neoplasm of unspecified breast, female',
    category: 'Neoplasms',
    commonNames: ['Breast cancer', 'Mammary carcinoma']
  },
  {
    code: 'C61',
    description: 'Malignant neoplasm of prostate',
    category: 'Neoplasms',
    commonNames: ['Prostate cancer', 'Prostatic carcinoma']
  },

  // Blood and Blood-forming Organs
  {
    code: 'D50.9',
    description: 'Iron deficiency anemia, unspecified',
    category: 'Blood Disorders',
    commonNames: ['Iron deficiency anemia', 'Anemia', 'Low iron']
  },
  {
    code: 'D64.9',
    description: 'Anemia, unspecified',
    category: 'Blood Disorders',
    commonNames: ['Anemia', 'Low blood count', 'Blood disorder']
  },

  // Endocrine, Nutritional and Metabolic Diseases
  {
    code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    category: 'Endocrine Disorders',
    commonNames: ['Type 2 diabetes', 'Diabetes mellitus', 'High blood sugar', 'DM2']
  },
  {
    code: 'E11.65',
    description: 'Type 2 diabetes with hyperglycemia',
    category: 'Endocrine Disorders',
    commonNames: ['Type 2 diabetes with high sugar', 'DM2 with hyperglycemia']
  },
  {
    code: 'E78.5',
    description: 'Disorder of bile acid and cholesterol metabolism, unspecified',
    category: 'Endocrine Disorders',
    commonNames: ['Cholesterol disorder', 'Bile acid disorder', 'Metabolic disorder']
  },
  {
    code: 'E78.00',
    description: 'Pure hypercholesterolemia, unspecified',
    category: 'Endocrine Disorders',
    commonNames: ['High cholesterol', 'Hypercholesterolemia', 'Elevated cholesterol']
  },
  {
    code: 'E03.9',
    description: 'Hypothyroidism, unspecified',
    category: 'Endocrine Disorders',
    commonNames: ['Hypothyroidism', 'Low thyroid', 'Underactive thyroid']
  },
  {
    code: 'E05.90',
    description: 'Thyrotoxicosis, unspecified without thyrotoxic crisis or storm',
    category: 'Endocrine Disorders',
    commonNames: ['Hyperthyroidism', 'Overactive thyroid', 'Thyrotoxicosis']
  },

  // Mental and Behavioral Disorders
  {
    code: 'F32.9',
    description: 'Major depressive disorder, unspecified',
    category: 'Mental Health',
    commonNames: ['Depression', 'Major depression', 'Clinical depression', 'MDD']
  },
  {
    code: 'F41.1',
    description: 'Generalized anxiety disorder',
    category: 'Mental Health',
    commonNames: ['Anxiety', 'Generalized anxiety', 'GAD', 'Anxiety disorder']
  },
  {
    code: 'F33.2',
    description: 'Major depressive disorder, recurrent, moderate',
    category: 'Mental Health',
    commonNames: ['Recurrent depression', 'Chronic depression', 'Moderate depression']
  },

  // Nervous System Diseases
  {
    code: 'G40.909',
    description: 'Epilepsy, unspecified, not intractable, without status epilepticus',
    category: 'Neurological Disorders',
    commonNames: ['Epilepsy', 'Seizure disorder', 'Convulsive disorder']
  },
  {
    code: 'G93.1',
    description: 'Anoxic brain damage, not elsewhere classified',
    category: 'Neurological Disorders',
    commonNames: ['Brain damage', 'Anoxic brain injury', 'Brain injury']
  },
  {
    code: 'G20',
    description: 'Parkinson disease',
    category: 'Neurological Disorders',
    commonNames: ['Parkinson disease', 'Parkinsons', 'PD', 'Shaking palsy']
  },

  // Eye and Adnexa Diseases
  {
    code: 'H25.9',
    description: 'Age-related cataract, unspecified',
    category: 'Eye Disorders',
    commonNames: ['Cataract', 'Age-related cataract', 'Lens opacity']
  },
  {
    code: 'H40.9',
    description: 'Unspecified glaucoma',
    category: 'Eye Disorders',
    commonNames: ['Glaucoma', 'High eye pressure', 'Optic nerve damage']
  },

  // Ear and Mastoid Process Diseases
  {
    code: 'H66.9',
    description: 'Otitis media, unspecified',
    category: 'Ear Disorders',
    commonNames: ['Ear infection', 'Otitis media', 'Middle ear infection']
  },
  {
    code: 'H91.9',
    description: 'Unspecified hearing loss',
    category: 'Ear Disorders',
    commonNames: ['Hearing loss', 'Deafness', 'Hearing impairment']
  },

  // Circulatory System Diseases
  {
    code: 'I10',
    description: 'Essential (primary) hypertension',
    category: 'Cardiovascular Disorders',
    commonNames: ['High blood pressure', 'Hypertension', 'HTN', 'Essential hypertension']
  },
  {
    code: 'I11.9',
    description: 'Hypertensive heart disease with heart failure, unspecified',
    category: 'Cardiovascular Disorders',
    commonNames: ['Hypertensive heart disease', 'Heart failure', 'Cardiac failure']
  },
  {
    code: 'I21.9',
    description: 'Acute myocardial infarction, unspecified',
    category: 'Cardiovascular Disorders',
    commonNames: ['Heart attack', 'Myocardial infarction', 'MI', 'Acute MI']
  },
  {
    code: 'I25.10',
    description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
    category: 'Cardiovascular Disorders',
    commonNames: ['Coronary artery disease', 'CAD', 'Atherosclerosis', 'Heart disease']
  },
  {
    code: 'I48.91',
    description: 'Unspecified atrial fibrillation',
    category: 'Cardiovascular Disorders',
    commonNames: ['Atrial fibrillation', 'AFib', 'Irregular heartbeat', 'Heart rhythm disorder']
  },
  {
    code: 'I50.9',
    description: 'Heart failure, unspecified',
    category: 'Cardiovascular Disorders',
    commonNames: ['Heart failure', 'Cardiac failure', 'CHF', 'Congestive heart failure']
  },
  {
    code: 'I63.9',
    description: 'Cerebral infarction, unspecified',
    category: 'Cardiovascular Disorders',
    commonNames: ['Stroke', 'Cerebral infarction', 'Brain attack', 'CVA']
  },
  {
    code: 'I70.209',
    description: 'Unspecified atherosclerosis of native arteries of extremities, unspecified extremity',
    category: 'Cardiovascular Disorders',
    commonNames: ['Peripheral artery disease', 'PAD', 'Atherosclerosis', 'Poor circulation']
  },

  // Respiratory System Diseases
  {
    code: 'J44.9',
    description: 'Chronic obstructive pulmonary disease, unspecified',
    category: 'Respiratory Disorders',
    commonNames: ['COPD', 'Chronic bronchitis', 'Emphysema', 'Lung disease']
  },
  {
    code: 'J45.909',
    description: 'Unspecified asthma with (acute) exacerbation',
    category: 'Respiratory Disorders',
    commonNames: ['Asthma', 'Asthma attack', 'Bronchial asthma', 'Reactive airway disease']
  },
  {
    code: 'J18.9',
    description: 'Pneumonia, unspecified organism',
    category: 'Respiratory Disorders',
    commonNames: ['Pneumonia', 'Lung infection', 'Pulmonary infection']
  },
  {
    code: 'J44.0',
    description: 'Chronic obstructive pulmonary disease with acute lower respiratory infection',
    category: 'Respiratory Disorders',
    commonNames: ['COPD with infection', 'Chronic bronchitis with infection']
  },

  // Digestive System Diseases
  {
    code: 'K21.9',
    description: 'Gastro-esophageal reflux disease without esophagitis',
    category: 'Digestive Disorders',
    commonNames: ['GERD', 'Acid reflux', 'Heartburn', 'Gastroesophageal reflux']
  },
  {
    code: 'K25.9',
    description: 'Gastric ulcer, unspecified as acute or chronic, without hemorrhage or perforation',
    category: 'Digestive Disorders',
    commonNames: ['Stomach ulcer', 'Gastric ulcer', 'Peptic ulcer', 'Ulcer']
  },
  {
    code: 'K29.70',
    description: 'Gastritis, unspecified, without bleeding',
    category: 'Digestive Disorders',
    commonNames: ['Gastritis', 'Stomach inflammation', 'Gastric inflammation']
  },
  {
    code: 'K51.90',
    description: 'Ulcerative colitis, unspecified, without complications',
    category: 'Digestive Disorders',
    commonNames: ['Ulcerative colitis', 'Colitis', 'Inflammatory bowel disease', 'IBD']
  },
  {
    code: 'K80.20',
    description: 'Calculus of gallbladder without cholecystitis without obstruction',
    category: 'Digestive Disorders',
    commonNames: ['Gallstones', 'Cholelithiasis', 'Gallbladder stones']
  },
  {
    code: 'K86.1',
    description: 'Other chronic pancreatitis',
    category: 'Digestive Disorders',
    commonNames: ['Chronic pancreatitis', 'Pancreas inflammation', 'Pancreatic disease']
  },

  // Skin and Subcutaneous Tissue Diseases
  {
    code: 'L23.9',
    description: 'Allergic contact dermatitis, unspecified cause',
    category: 'Skin Disorders',
    commonNames: ['Contact dermatitis', 'Skin allergy', 'Allergic rash', 'Eczema']
  },
  {
    code: 'L30.9',
    description: 'Dermatitis, unspecified',
    category: 'Skin Disorders',
    commonNames: ['Dermatitis', 'Skin inflammation', 'Rash', 'Skin condition']
  },
  {
    code: 'L40.9',
    description: 'Psoriasis, unspecified',
    category: 'Skin Disorders',
    commonNames: ['Psoriasis', 'Psoriatic skin', 'Scaly skin', 'Skin plaques']
  },

  // Musculoskeletal System and Connective Tissue Diseases
  {
    code: 'M15.9',
    description: 'Polyosteoarthritis, unspecified site',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Osteoarthritis', 'Joint arthritis', 'Degenerative joint disease', 'OA']
  },
  {
    code: 'M16.9',
    description: 'Osteoarthritis of hip, unspecified',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Hip arthritis', 'Hip osteoarthritis', 'Hip joint disease']
  },
  {
    code: 'M17.9',
    description: 'Osteoarthritis of knee, unspecified',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Knee arthritis', 'Knee osteoarthritis', 'Knee joint disease']
  },
  {
    code: 'M54.5',
    description: 'Low back pain',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Low back pain', 'LBP', 'Backache', 'Lumbar pain']
  },
  {
    code: 'M79.3',
    description: 'Pain in unspecified wrist and hand',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Wrist pain', 'Hand pain', 'Joint pain', 'Arthralgia']
  },
  {
    code: 'M79.359',
    description: 'Pain in unspecified ankle',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Ankle pain', 'Foot pain', 'Joint pain', 'Arthralgia']
  },
  {
    code: 'M81.0',
    description: 'Age-related osteoporosis without current pathological fracture',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Osteoporosis', 'Bone loss', 'Thin bones', 'Age-related bone loss']
  },
  {
    code: 'M79.7',
    description: 'Fibromyalgia',
    category: 'Musculoskeletal Disorders',
    commonNames: ['Fibromyalgia', 'Fibro', 'Chronic pain syndrome', 'Muscle pain']
  },

  // Genitourinary System Diseases
  {
    code: 'N18.9',
    description: 'Chronic kidney disease, unspecified',
    category: 'Genitourinary Disorders',
    commonNames: ['Chronic kidney disease', 'CKD', 'Kidney failure', 'Renal disease']
  },
  {
    code: 'N39.0',
    description: 'Urinary tract infection, site not specified',
    category: 'Genitourinary Disorders',
    commonNames: ['UTI', 'Urinary tract infection', 'Bladder infection', 'Kidney infection']
  },
  {
    code: 'N18.3',
    description: 'Chronic kidney disease, stage 3 (moderate)',
    category: 'Genitourinary Disorders',
    commonNames: ['Stage 3 CKD', 'Moderate kidney disease', 'Kidney dysfunction']
  },

  // Pregnancy, Childbirth and Puerperium
  {
    code: 'O26.9',
    description: 'Pregnancy-related condition, unspecified',
    category: 'Pregnancy',
    commonNames: ['Pregnancy complication', 'Pregnancy condition', 'Maternal condition']
  },

  // Perinatal Period Conditions
  {
    code: 'P59.9',
    description: 'Neonatal jaundice, unspecified',
    category: 'Perinatal Conditions',
    commonNames: ['Neonatal jaundice', 'Newborn jaundice', 'Baby jaundice']
  },

  // Congenital Malformations
  {
    code: 'Q21.9',
    description: 'Congenital malformation of cardiac septum, unspecified',
    category: 'Congenital Conditions',
    commonNames: ['Heart defect', 'Congenital heart disease', 'Cardiac malformation']
  },

  // Symptoms, Signs and Abnormal Clinical Findings
  {
    code: 'R50.9',
    description: 'Fever, unspecified',
    category: 'Symptoms',
    commonNames: ['Fever', 'Pyrexia', 'High temperature', 'Elevated temperature']
  },
  {
    code: 'R51.9',
    description: 'Headache, unspecified',
    category: 'Symptoms',
    commonNames: ['Headache', 'Head pain', 'Cephalalgia', 'Migraine']
  },
  {
    code: 'R52',
    description: 'Pain, unspecified',
    category: 'Symptoms',
    commonNames: ['Pain', 'Chronic pain', 'Generalized pain', 'Body pain']
  },
  {
    code: 'R53.1',
    description: 'Weakness',
    category: 'Symptoms',
    commonNames: ['Weakness', 'Muscle weakness', 'Generalized weakness', 'Fatigue']
  },
  {
    code: 'R53.83',
    description: 'Other fatigue',
    category: 'Symptoms',
    commonNames: ['Fatigue', 'Tiredness', 'Exhaustion', 'Lethargy']
  },
  {
    code: 'R55',
    description: 'Syncope and collapse',
    category: 'Symptoms',
    commonNames: ['Fainting', 'Syncope', 'Passing out', 'Loss of consciousness']
  },
  {
    code: 'R56.9',
    description: 'Unspecified convulsions',
    category: 'Symptoms',
    commonNames: ['Seizure', 'Convulsion', 'Fit', 'Epileptic attack']
  },
  {
    code: 'R60.9',
    description: 'Edema, unspecified',
    category: 'Symptoms',
    commonNames: ['Edema', 'Swelling', 'Fluid retention', 'Puffiness']
  },
  {
    code: 'R68.2',
    description: 'Dry mouth, unspecified',
    category: 'Symptoms',
    commonNames: ['Dry mouth', 'Xerostomia', 'Mouth dryness', 'Salivary deficiency']
  },
  {
    code: 'R73.9',
    description: 'Hyperglycemia, unspecified',
    category: 'Symptoms',
    commonNames: ['High blood sugar', 'Hyperglycemia', 'Elevated glucose', 'High glucose']
  },
  {
    code: 'R79.9',
    description: 'Other specified abnormal findings of blood chemistry',
    category: 'Symptoms',
    commonNames: ['Abnormal blood work', 'Blood chemistry abnormality', 'Lab abnormality']
  },

  // Injury, Poisoning and External Causes
  {
    code: 'S72.9',
    description: 'Fracture of femur, unspecified',
    category: 'Injuries',
    commonNames: ['Femur fracture', 'Thigh bone break', 'Leg fracture', 'Hip fracture']
  },
  {
    code: 'S82.9',
    description: 'Fracture of lower leg, unspecified',
    category: 'Injuries',
    commonNames: ['Lower leg fracture', 'Tibia fracture', 'Fibula fracture', 'Leg break']
  },
  {
    code: 'T78.40',
    description: 'Allergy, unspecified',
    category: 'Injuries',
    commonNames: ['Allergy', 'Allergic reaction', 'Hypersensitivity', 'Allergic response']
  },

  // External Causes of Morbidity
  {
    code: 'V43.5',
    description: 'Car driver injured in collision with car, pick-up truck or van in traffic accident',
    category: 'External Causes',
    commonNames: ['Car accident', 'Motor vehicle collision', 'Traffic accident', 'MVC']
  },

  // Factors Influencing Health Status
  {
    code: 'Z23',
    description: 'Encounter for immunization',
    category: 'Health Factors',
    commonNames: ['Vaccination', 'Immunization', 'Vaccine', 'Shot']
  },
  {
    code: 'Z51.11',
    description: 'Encounter for antineoplastic chemotherapy',
    category: 'Health Factors',
    commonNames: ['Chemotherapy', 'Cancer treatment', 'Antineoplastic therapy', 'Chemo']
  },
  {
    code: 'Z79.4',
    description: 'Long term (current) use of insulin',
    category: 'Health Factors',
    commonNames: ['Insulin use', 'Long-term insulin', 'Diabetes medication', 'Insulin therapy']
  },
  {
    code: 'Z79.899',
    description: 'Other long term (current) drug therapy',
    category: 'Health Factors',
    commonNames: ['Long-term medication', 'Chronic medication', 'Maintenance therapy', 'Drug therapy']
  }
];

// Function to search ICD-10 codes by description, common names, or code
const searchICD10 = (query) => {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return icd10Data.filter(item => 
    item.code.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm) ||
    item.commonNames.some(name => name.toLowerCase().includes(searchTerm))
  );
};

// Function to get ICD-10 code by exact match
const getICD10ByCode = (code) => {
  return icd10Data.find(item => item.code === code);
};

// Function to get ICD-10 codes by category
const getICD10ByCategory = (category) => {
  return icd10Data.filter(item => item.category === category);
};

// Function to get all categories
const getICD10Categories = () => {
  return [...new Set(icd10Data.map(item => item.category))];
};

module.exports = {
  icd10Data,
  searchICD10,
  getICD10ByCode,
  getICD10ByCategory,
  getICD10Categories
};
