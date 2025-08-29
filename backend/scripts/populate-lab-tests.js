const { runQuery, getRow, getAll } = require('../database/database');

// Comprehensive laboratory tests data based on the Excel file
const labTestsData = [
  // BIOCHEMISTRY TESTS
  { testName: 'ABS (BLOOD GAS ANALYSIS ARTERIAL)', category: 'BIOCHEMISTRY', subcategory: 'Blood Gas Analysis', price: 800.00, testCode: 'BGA001', description: 'Arterial blood gas analysis for acid-base balance and oxygenation status' },
  { testName: 'ALBUMIN, SERUM', category: 'BIOCHEMISTRY', subcategory: 'Protein Tests', price: 150.00, testCode: 'ALB001', description: 'Serum albumin level measurement' },
  { testName: 'AMMONIA, BLOOD', category: 'BIOCHEMISTRY', subcategory: 'Metabolic Tests', price: 300.00, testCode: 'AMM001', description: 'Blood ammonia level for liver function assessment' },
  { testName: 'BLOOD UREA NITROGEN', category: 'BIOCHEMISTRY', subcategory: 'Kidney Function', price: 120.00, testCode: 'BUN001', description: 'Blood urea nitrogen for kidney function evaluation' },
  { testName: 'CALCIUM, SERUM', category: 'BIOCHEMISTRY', subcategory: 'Electrolytes', price: 120.00, testCode: 'CAL001', description: 'Serum calcium level measurement' },
  { testName: 'CHOLESTEROL TOTAL', category: 'BIOCHEMISTRY', subcategory: 'Lipid Profile', price: 150.00, testCode: 'CHOL001', description: 'Total cholesterol measurement' },
  { testName: 'COMPLETE BLOOD COUNT (CBC)', category: 'HAEMATOLOGY', subcategory: 'Blood Count', price: 250.00, testCode: 'CBC001', description: 'Complete blood count including RBC, WBC, and platelets' },
  { testName: 'ELECTROLYTES (Na/K/Cl)', category: 'BIOCHEMISTRY', subcategory: 'Electrolytes', price: 200.00, testCode: 'ELEC001', description: 'Sodium, potassium, and chloride levels' },
  { testName: 'GLUCOSE (FASTING)', category: 'BIOCHEMISTRY', subcategory: 'Glucose Tests', price: 100.00, testCode: 'GLU001', description: 'Fasting blood glucose level' },
  { testName: 'GLUCOSE (POST PRANDIAL)', category: 'BIOCHEMISTRY', subcategory: 'Glucose Tests', price: 100.00, testCode: 'GLU002', description: 'Post-meal blood glucose level' },
  { testName: 'GLUCOSE (RANDOM)', category: 'BIOCHEMISTRY', subcategory: 'Glucose Tests', price: 100.00, testCode: 'GLU003', description: 'Random blood glucose level' },
  { testName: 'LIPID PROFILE', category: 'BIOCHEMISTRY', subcategory: 'Lipid Profile', price: 400.00, testCode: 'LIPID001', description: 'Complete lipid profile including cholesterol, triglycerides, HDL, LDL' },
  { testName: 'LIVER FUNCTION TESTS (LFT)', category: 'BIOCHEMISTRY', subcategory: 'Liver Function', price: 500.00, testCode: 'LFT001', description: 'Comprehensive liver function panel' },
  { testName: 'MAGNESIUM', category: 'BIOCHEMISTRY', subcategory: 'Electrolytes', price: 120.00, testCode: 'MAG001', description: 'Serum magnesium level' },
  { testName: 'POTASSIUM', category: 'BIOCHEMISTRY', subcategory: 'Electrolytes', price: 120.00, testCode: 'K001', description: 'Serum potassium level' },
  { testName: 'PROTEIN TOTAL', category: 'BIOCHEMISTRY', subcategory: 'Protein Tests', price: 150.00, testCode: 'PROT001', description: 'Total protein measurement' },
  { testName: 'SODIUM', category: 'BIOCHEMISTRY', subcategory: 'Electrolytes', price: 120.00, testCode: 'NA001', description: 'Serum sodium level' },
  { testName: 'TRIGLYCERIDES', category: 'BIOCHEMISTRY', subcategory: 'Lipid Profile', price: 150.00, testCode: 'TRIG001', description: 'Triglyceride level measurement' },
  { testName: 'TROPONIN - I (QUANTITATIVE)', category: 'BIOCHEMISTRY', subcategory: 'Cardiac Markers', price: 800.00, testCode: 'TROP001', description: 'Cardiac troponin I for heart attack detection' },
  { testName: 'UREA, SERUM', category: 'BIOCHEMISTRY', subcategory: 'Kidney Function', price: 120.00, testCode: 'UREA001', description: 'Serum urea measurement' },
  { testName: 'URIC ACID', category: 'BIOCHEMISTRY', subcategory: 'Metabolic Tests', price: 120.00, testCode: 'UA001', description: 'Serum uric acid level' },
  { testName: 'CORTISOL', category: 'BIOCHEMISTRY', subcategory: 'Hormone Tests', price: 400.00, testCode: 'CORT001', description: 'Cortisol hormone level measurement' },
  { testName: 'FERRITIN', category: 'BIOCHEMISTRY', subcategory: 'Iron Studies', price: 300.00, testCode: 'FERR001', description: 'Ferritin level for iron storage assessment' },
  { testName: 'PROLACTIN', category: 'BIOCHEMISTRY', subcategory: 'Hormone Tests', price: 400.00, testCode: 'PROL001', description: 'Prolactin hormone level' },
  { testName: 'THYROID FUNCTION TESTS (TFT)', category: 'BIOCHEMISTRY', subcategory: 'Thyroid Function', price: 600.00, testCode: 'TFT001', description: 'Complete thyroid function panel' },
  { testName: 'VITAMIN B12', category: 'BIOCHEMISTRY', subcategory: 'Vitamin Tests', price: 400.00, testCode: 'B12001', description: 'Vitamin B12 level measurement' },
  { testName: 'VITAMIN D', category: 'BIOCHEMISTRY', subcategory: 'Vitamin Tests', price: 500.00, testCode: 'D001', description: 'Vitamin D level measurement' },
  { testName: 'CRP (C-REACTIVE PROTEIN)', category: 'BIOCHEMISTRY', subcategory: 'Inflammation Markers', price: 300.00, testCode: 'CRP001', description: 'C-reactive protein for inflammation assessment' },
  { testName: 'D-DIMER', category: 'BIOCHEMISTRY', subcategory: 'Coagulation', price: 600.00, testCode: 'DDIM001', description: 'D-dimer for blood clot detection' },
  { testName: 'INTERLEUKIN-6', category: 'BIOCHEMISTRY', subcategory: 'Cytokines', price: 800.00, testCode: 'IL6001', description: 'Interleukin-6 cytokine measurement' },

  // URINE TESTS
  { testName: 'AMYLASE, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UAMY001', description: 'Urine amylase level measurement' },
  { testName: 'BLOOD UREA NITROGEN, 24 hrs, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UBUN001', description: '24-hour urine BUN measurement' },
  { testName: 'CALCIUM_24 HR, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UCAL001', description: '24-hour urine calcium measurement' },
  { testName: 'CHLORIDE, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 150.00, testCode: 'UCL001', description: 'Urine chloride level' },
  { testName: 'CREATININE 24 HRS, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UCR001', description: '24-hour urine creatinine measurement' },
  { testName: 'PHOSPHORUS 24 HRS, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UPHOS001', description: '24-hour urine phosphorus measurement' },
  { testName: 'PROTEIN 24 HRS, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UPROT001', description: '24-hour urine protein measurement' },
  { testName: 'URIC ACID 24 HRS, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UUA001', description: '24-hour urine uric acid measurement' },
  { testName: 'BENCE JONES PROTEINS, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 300.00, testCode: 'UBJP001', description: 'Bence Jones protein detection in urine' },
  { testName: 'BILE PIGMENTS & BILE SALTS, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UBPS001', description: 'Bile pigments and salts in urine' },
  { testName: 'PH, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 100.00, testCode: 'UPH001', description: 'Urine pH measurement' },
  { testName: 'PREGNANCY(B-HCG) TEST, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 150.00, testCode: 'UHCG001', description: 'Urine pregnancy test' },
  { testName: 'SPECIFIC GRAVITY, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 100.00, testCode: 'USG001', description: 'Urine specific gravity measurement' },
  { testName: 'URINE FOR EOSINOPHILS', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 150.00, testCode: 'UEOS001', description: 'Eosinophil count in urine' },
  { testName: 'URINE KETONES', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 100.00, testCode: 'UKET001', description: 'Ketone detection in urine' },
  { testName: 'URINE PROTEINS', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 100.00, testCode: 'UPROT002', description: 'Protein detection in urine' },
  { testName: 'URINE ROUTINE EXAMINATION', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 150.00, testCode: 'URE001', description: 'Complete urine routine examination' },
  { testName: 'URINE SUGAR', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 100.00, testCode: 'USUG001', description: 'Sugar detection in urine' },
  { testName: 'URINE UROBILINOGEN', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 150.00, testCode: 'UURO001', description: 'Urobilinogen in urine' },
  { testName: 'URINE MICROALBUMIN', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 300.00, testCode: 'UMALB001', description: 'Microalbumin in urine' },
  { testName: 'URINE ALBUMIN TO CREATININE RATIO, URINE', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 300.00, testCode: 'UACR001', description: 'Albumin to creatinine ratio in urine' },
  { testName: 'DYSMORPHIC RBC', category: 'CLINICAL PATHOLOGY', subcategory: 'Urine Tests', price: 200.00, testCode: 'UDRBC001', description: 'Dysmorphic red blood cells in urine' },

  // FLUID/OTHER SAMPLE TESTS
  { testName: 'AMYLASE FLUID', category: 'CLINICAL PATHOLOGY', subcategory: 'Body Fluids', price: 250.00, testCode: 'FAMY001', description: 'Amylase in body fluids' },
  { testName: 'BODY FLUID (PRO-CELL)', category: 'CLINICAL PATHOLOGY', subcategory: 'Body Fluids', price: 300.00, testCode: 'BFPC001', description: 'Body fluid cell count and analysis' },
  { testName: 'BODY FLUID FOR (NA/K/CL)', category: 'CLINICAL PATHOLOGY', subcategory: 'Body Fluids', price: 200.00, testCode: 'BFELEC001', description: 'Electrolytes in body fluids' },
  { testName: 'PROTEIN, CSF', category: 'CLINICAL PATHOLOGY', subcategory: 'CSF Analysis', price: 300.00, testCode: 'CSFP001', description: 'Protein in cerebrospinal fluid' },
  { testName: 'PROTEIN, FLUID', category: 'CLINICAL PATHOLOGY', subcategory: 'Body Fluids', price: 200.00, testCode: 'FLUDP001', description: 'Protein in body fluids' },
  { testName: 'LACTATE DEHYDROGENASE, FLUID', category: 'CLINICAL PATHOLOGY', subcategory: 'Body Fluids', price: 250.00, testCode: 'FLUDLDH001', description: 'LDH in body fluids' },
  { testName: 'FRUCTOSE, SEMEN', category: 'CLINICAL PATHOLOGY', subcategory: 'Semen Analysis', price: 200.00, testCode: 'SEMFRU001', description: 'Fructose in semen' },
  { testName: 'STOOL, OCCULT BLOOD', category: 'CLINICAL PATHOLOGY', subcategory: 'Stool Tests', price: 150.00, testCode: 'STOOLOB001', description: 'Occult blood in stool' },
  { testName: 'STOOL FOR REDUCING SUBSTANCE', category: 'CLINICAL PATHOLOGY', subcategory: 'Stool Tests', price: 150.00, testCode: 'STOOLRS001', description: 'Reducing substances in stool' },
  { testName: 'STOOL ROUTINE EXAMINATION', category: 'CLINICAL PATHOLOGY', subcategory: 'Stool Tests', price: 200.00, testCode: 'STOOLRE001', description: 'Complete stool routine examination' },

  // MICROBIOLOGY TESTS
  { testName: 'CULTURE AEROBIC TISSUE', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 400.00, testCode: 'CULT001', description: 'Aerobic culture of tissue samples' },
  { testName: 'CULTURE AEROBIC CATHETER/TIPS', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 350.00, testCode: 'CULT002', description: 'Aerobic culture of catheter tips' },
  { testName: 'CULTURE AEROBIC PUS/DISCHARGE', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 350.00, testCode: 'CULT003', description: 'Aerobic culture of pus/discharge' },
  { testName: 'CULTURE AEROBIC SEMEN', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 350.00, testCode: 'CULT004', description: 'Aerobic culture of semen' },
  { testName: 'CULTURE AEROBIC SPUTUM', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 350.00, testCode: 'CULT005', description: 'Aerobic culture of sputum' },
  { testName: 'CULTURE AEROBIC STOOL', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 350.00, testCode: 'CULT006', description: 'Aerobic culture of stool' },
  { testName: 'CULTURE AEROBIC URINE', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 350.00, testCode: 'CULT007', description: 'Aerobic culture of urine' },
  { testName: 'CULTURE AEROBIC SWAB', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 300.00, testCode: 'CULT008', description: 'Aerobic culture of swab samples' },
  { testName: 'CULTURE AEROBIC BLOOD', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 500.00, testCode: 'CULT009', description: 'Aerobic blood culture' },
  { testName: 'CULTURE AEROBIC BODY FLUID', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 400.00, testCode: 'CULT010', description: 'Aerobic culture of body fluids' },
  { testName: 'CULTURE AEROBIC BRONCHOALVEOLAR LAVAGE', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 450.00, testCode: 'CULT011', description: 'Aerobic culture of BAL samples' },
  { testName: 'CULTURE AEROBIC CSF', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: 450.00, testCode: 'CULT012', description: 'Aerobic culture of CSF' },
  { testName: 'CULTURE AEROBIC ENDO TRACHEAL SECRETION', category: 'MICROBIOLOGY', subcategory: 'Culture Tests', price: '450.00', testCode: 'CULT013', description: 'Aerobic culture of endotracheal secretions' },

  // STAINS AND SPECIAL TESTS
  { testName: 'AFB (ZN) STAIN', category: 'MICROBIOLOGY', subcategory: 'Stains', price: 200.00, testCode: 'AFB001', description: 'Acid-fast bacilli Ziehl-Neelsen stain' },
  { testName: 'GRAM STAIN', category: 'MICROBIOLOGY', subcategory: 'Stains', price: 150.00, testCode: 'GRAM001', description: 'Gram staining for bacterial identification' },
  { testName: 'MANTOUX TEST', category: 'MICROBIOLOGY', subcategory: 'Tuberculosis Tests', price: 100.00, testCode: 'MANTOUX001', description: 'Mantoux tuberculin skin test' },

  // SEROLOGY TESTS
  { testName: 'ASO TITRE QUANTITATIVE', category: 'SEROLOGY', subcategory: 'Antibody Tests', price: 300.00, testCode: 'ASO001', description: 'Anti-streptolysin O titre' },
  { testName: 'MALARIA ANTIGEN', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 250.00, testCode: 'MAL001', description: 'Malaria antigen detection' },
  { testName: 'WIDAL TEST, TYPHOID', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 200.00, testCode: 'WIDAL001', description: 'Widal test for typhoid fever' },
  { testName: 'HIV TEST', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 300.00, testCode: 'HIV001', description: 'HIV antibody/antigen test' },
  { testName: 'HEPATITIS PANEL', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 800.00, testCode: 'HEP001', description: 'Complete hepatitis panel' },
  { testName: 'STD SCREENING', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 600.00, testCode: 'STD001', description: 'Sexually transmitted disease screening' },
  { testName: 'ALLERGY TESTING', category: 'SEROLOGY', subcategory: 'Allergy Tests', price: 500.00, testCode: 'ALLERGY001', description: 'Allergy testing panel' },
  { testName: 'COVID-19 Antigen test (Rapid Test)', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 400.00, testCode: 'COVID001', description: 'Rapid COVID-19 antigen test' },
  { testName: 'CYTOMEGALOVIRUS (CMV) antibody IgG/IgM', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 400.00, testCode: 'CMV001', description: 'CMV antibody testing' },
  { testName: 'CRYPTOCOCCUS ANTIGEN', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 500.00, testCode: 'CRYPTO001', description: 'Cryptococcus antigen detection' },
  { testName: 'HELICOBACTER PYLORI ANTIGEN', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 300.00, testCode: 'HP001', description: 'H. pylori antigen detection' },
  { testName: 'CLOSTRIDIUM DIFFICILE TOXIN A & B', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 400.00, testCode: 'CDIFF001', description: 'C. difficile toxin detection' },
  { testName: 'DENGUE ANTIGEN NS1', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 400.00, testCode: 'DENGUE001', description: 'Dengue NS1 antigen detection' },
  { testName: 'DENGUE ANTIBODY IgM', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 400.00, testCode: 'DENGUE002', description: 'Dengue IgM antibody detection' },
  { testName: 'GENEXPERT MTB', category: 'SEROLOGY', subcategory: 'Tuberculosis Tests', price: 1200.00, testCode: 'GENEXP001', description: 'GeneXpert MTB detection' },
  { testName: 'GENEXPERT MTB WITH RIFAMPICIN RESISTANCE', category: 'SEROLOGY', subcategory: 'Tuberculosis Tests', price: 1500.00, testCode: 'GENEXP002', description: 'GeneXpert MTB with rifampicin resistance' },
  { testName: 'SCRUB TYPHUS IGG AND IGM', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 400.00, testCode: 'SCRUB001', description: 'Scrub typhus antibody testing' },
  { testName: 'HEPATITIS A ANTIBODY (ANTI-HAV 1 IGM)', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 300.00, testCode: 'HAV001', description: 'Hepatitis A IgM antibody' },
  { testName: 'HEPATITIS E (IgM) Anti HEV', category: 'SEROLOGY', subcategory: 'Infectious Disease', price: 300.00, testCode: 'HEV001', description: 'Hepatitis E IgM antibody' },

  // CANCER MARKERS
  { testName: 'CEA', category: 'BIOCHEMISTRY', subcategory: 'Tumor Markers', price: 600.00, testCode: 'CEA001', description: 'Carcinoembryonic antigen' },
  { testName: 'CA-125', category: 'BIOCHEMISTRY', subcategory: 'Tumor Markers', price: 600.00, testCode: 'CA125001', description: 'Cancer antigen 125' },
  { testName: 'CA 19-9 (PANCREATIC CANCER MARKER)', category: 'BIOCHEMISTRY', subcategory: 'Tumor Markers', price: 600.00, testCode: 'CA199001', description: 'Cancer antigen 19-9' },
  { testName: 'AFP (ALPHA FETOPROTEIN)', category: 'BIOCHEMISTRY', subcategory: 'Tumor Markers', price: 600.00, testCode: 'AFP001', description: 'Alpha-fetoprotein' },

  // SPECIALIZED TESTS
  { testName: 'ADA (ADENOSINE DEAMINASE)', category: 'BIOCHEMISTRY', subcategory: 'Specialized Tests', price: 400.00, testCode: 'ADA001', description: 'Adenosine deaminase activity' },
  { testName: 'OSMOLALITY', category: 'BIOCHEMISTRY', subcategory: 'Specialized Tests', price: 300.00, testCode: 'OSM001', description: 'Serum osmolality measurement' },
  { testName: 'RENAL FUNCTION TEST', category: 'BIOCHEMISTRY', subcategory: 'Kidney Function', price: 400.00, testCode: 'RFT001', description: 'Comprehensive renal function panel' },
  { testName: 'RHEUMATOID FACTOR (QUANTITATIVE)', category: 'SEROLOGY', subcategory: 'Autoimmune Tests', price: 300.00, testCode: 'RF001', description: 'Rheumatoid factor measurement' },
  { testName: 'GLYCOSYLATED HEMOGLOBIN', category: 'HAEMATOLOGY', subcategory: 'Diabetes Tests', price: 300.00, testCode: 'HBA1C001', description: 'Glycosylated hemoglobin (HbA1c)' },
  { testName: 'Hb ELECTROPHORESIS', category: 'HAEMATOLOGY', subcategory: 'Hemoglobin Tests', price: 400.00, testCode: 'HBE001', description: 'Hemoglobin electrophoresis' },
  { testName: 'TMA (ANTI-THYROID PEROXIDE ANTIBODY-ANTI TPO)', category: 'SEROLOGY', subcategory: 'Autoimmune Tests', price: 400.00, testCode: 'TPO001', description: 'Anti-thyroid peroxidase antibody' },

  // HAEMATOLOGY TESTS
  { testName: 'APTT', category: 'HAEMATOLOGY', subcategory: 'Coagulation', price: 250.00, testCode: 'APTT001', description: 'Activated partial thromboplastin time' },
  { testName: 'PT-INR', category: 'HAEMATOLOGY', subcategory: 'Coagulation', price: 250.00, testCode: 'PTINR001', description: 'Prothrombin time with INR' },
  { testName: 'ESR', category: 'HAEMATOLOGY', subcategory: 'Inflammation', price: 100.00, testCode: 'ESR001', description: 'Erythrocyte sedimentation rate' },
  { testName: 'RETICULOCYTE COUNT', category: 'HAEMATOLOGY', subcategory: 'Blood Count', price: 200.00, testCode: 'RET001', description: 'Reticulocyte count' },
  { testName: 'BONE MARROW ASPIRATION', category: 'HAEMATOLOGY', subcategory: 'Special Procedures', price: 800.00, testCode: 'BMA001', description: 'Bone marrow aspiration' },
  { testName: 'MALARIAL PARASITE', category: 'HAEMATOLOGY', subcategory: 'Parasitology', price: 150.00, testCode: 'MP001', description: 'Malarial parasite detection' },
  { testName: 'PCV', category: 'HAEMATOLOGY', subcategory: 'Blood Count', price: 100.00, testCode: 'PCV001', description: 'Packed cell volume' },
  { testName: 'PLATELET COUNT', category: 'HAEMATOLOGY', subcategory: 'Blood Count', price: 100.00, testCode: 'PLT001', description: 'Platelet count' },
  { testName: 'TOTAL LEUKOCYTE COUNT', category: 'HAEMATOLOGY', subcategory: 'Blood Count', price: 100.00, testCode: 'TLC001', description: 'Total leukocyte count' },
  { testName: 'TOTAL RBC COUNT', category: 'HAEMATOLOGY', subcategory: 'Blood Count', price: 100.00, testCode: 'TRBC001', description: 'Total red blood cell count' },

  // CYTOLOGY TESTS
  { testName: 'CYTOLOGY FOR MALIGNANT CELLS', category: 'CYTOLOGY', subcategory: 'Cellular Analysis', price: 400.00, testCode: 'CYT001', description: 'Cytology for malignant cell detection' },
  { testName: 'PAP SMEAR', category: 'CYTOLOGY', subcategory: 'Gynecological', price: 300.00, testCode: 'PAP001', description: 'Papanicolaou smear test' },

  // HISTOPATHOLOGY TESTS
  { testName: 'SMALL TISSUE BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 600.00, testCode: 'STB001', description: 'Small tissue biopsy examination' },
  { testName: 'LARGE TISSUE BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 800.00, testCode: 'LTB001', description: 'Large tissue biopsy examination' },
  { testName: 'LARGE COMPLEX TISSUE BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 1000.00, testCode: 'LCTB001', description: 'Large complex tissue biopsy examination' },
  { testName: 'MEDIUM TISSUE BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 700.00, testCode: 'MTB001', description: 'Medium tissue biopsy examination' },
  { testName: 'TISSUE BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 600.00, testCode: 'TB001', description: 'Standard tissue biopsy examination' },
  { testName: 'HISTOPATHOLOGY SLIDES AND BLOCK ISSUES', category: 'HISTOPATHOLOGY', subcategory: 'Special Services', price: 200.00, testCode: 'HSB001', description: 'Histopathology slides and block issues' },
  { testName: 'HISTOPATHOLOGY NEEDLE / CORE BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 800.00, testCode: 'HNCB001', description: 'Needle/core biopsy examination' },
  { testName: 'HISTOPATHOLOGY CHIPS', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 600.00, testCode: 'HC001', description: 'Histopathology chips examination' },
  { testName: 'HISTOPATHOLOGY SKIN BIOPSY', category: 'HISTOPATHOLOGY', subcategory: 'Biopsy', price: 600.00, testCode: 'HSKB001', description: 'Skin biopsy examination' },
  { testName: 'HISTOPATHOLOGY BIOPSY (SECOND OPINION)', category: 'HISTOPATHOLOGY', subcategory: 'Special Services', price: 400.00, testCode: 'HSO001', description: 'Second opinion on biopsy' },
  { testName: 'SPECIAL STAINS', category: 'HISTOPATHOLOGY', subcategory: 'Special Stains', price: 300.00, testCode: 'SS001', description: 'Special histological stains' },

  // PATHLAB OTHERS
  { testName: 'GLUCOSE GLUCOMETER', category: 'PATHLAB OTHERS', subcategory: 'Point of Care', price: 50.00, testCode: 'GLUG001', description: 'Glucometer glucose testing' },
  { testName: 'SWINE FLU TESTING', category: 'PATHLAB OTHERS', subcategory: 'Infectious Disease', price: 400.00, testCode: 'SWINE001', description: 'Swine flu testing' },
  { testName: 'SAMPLE HOME COLLECTION CHARGES', category: 'PATHLAB OTHERS', subcategory: 'Services', price: 100.00, testCode: 'SHC001', description: 'Home sample collection service' },
  { testName: 'VBG (BLOOD GAS ANALYSIS VENOUS)', category: 'PATHLAB OTHERS', subcategory: 'Blood Gas Analysis', price: 600.00, testCode: 'VBG001', description: 'Venous blood gas analysis' }
];

async function populateLabTests() {
  try {
    console.log('Starting to populate lab tests database...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await runQuery('DELETE FROM lab_tests');
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const test of labTestsData) {
      try {
        // Check if test already exists
        const existingTest = await getRow(
          'SELECT id FROM lab_tests WHERE testCode = ? OR testName = ?',
          [test.testCode, test.testName]
        );
        
        if (existingTest) {
          console.log(`Skipping existing test: ${test.testName}`);
          skippedCount++;
          continue;
        }
        
        // Insert new test
        const result = await runQuery(`
          INSERT INTO lab_tests (testId, testName, testCode, category, subcategory, price, description, preparation, turnaroundTime, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          test.testCode, // Using testCode as testId for simplicity
          test.testName,
          test.testCode,
          test.category,
          test.subcategory,
          test.price,
          test.description,
          'Standard preparation required', // Default preparation
          '24-48 hours', // Default turnaround time
          1 // isActive
        ]);
        
        console.log(`Inserted: ${test.testName} (${test.testCode})`);
        insertedCount++;
        
      } catch (error) {
        console.error(`Error inserting test ${test.testName}:`, error.message);
      }
    }
    
    console.log(`\nDatabase population completed!`);
    console.log(`Inserted: ${insertedCount} tests`);
    console.log(`Skipped: ${skippedCount} tests (already existed)`);
    console.log(`Total processed: ${labTestsData.length} tests`);
    
  } catch (error) {
    console.error('Error populating lab tests:', error);
  }
}

// Run the population script
populateLabTests().then(() => {
  console.log('Script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
