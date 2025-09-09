// Medical text correction and formatting utilities

// Common medical spelling corrections
const medicalCorrections = {
  // Common misspellings
  'fever': 'FEVER',
  'headache': 'HEADACHE',
  'cough': 'COUGH',
  'cold': 'COLD',
  'pain': 'PAIN',
  'nausea': 'NAUSEA',
  'vomiting': 'VOMITING',
  'diarrhea': 'DIARRHEA',
  'diarrhoea': 'DIARRHEA',
  'hypertension': 'HYPERTENSION',
  'diabetes': 'DIABETES',
  'asthma': 'ASTHMA',
  'pneumonia': 'PNEUMONIA',
  'bronchitis': 'BRONCHITIS',
  'gastritis': 'GASTRITIS',
  'ulcer': 'ULCER',
  'arthritis': 'ARTHRITIS',
  'migraine': 'MIGRAINE',
  'anemia': 'ANEMIA',
  'anaemia': 'ANEMIA',
  'infection': 'INFECTION',
  'inflammation': 'INFLAMMATION',
  'allergy': 'ALLERGY',
  'allergic': 'ALLERGIC',
  'dizziness': 'DIZZINESS',
  'fatigue': 'FATIGUE',
  'weakness': 'WEAKNESS',
  'shortness': 'SHORTNESS',
  'breath': 'BREATH',
  'breathing': 'BREATHING',
  'chest': 'CHEST',
  'abdominal': 'ABDOMINAL',
  'stomach': 'STOMACH',
  'back': 'BACK',
  'joint': 'JOINT',
  'muscle': 'MUSCLE',
  'skin': 'SKIN',
  'rash': 'RASH',
  'swelling': 'SWELLING',
  'bleeding': 'BLEEDING',
  'urine': 'URINE',
  'urinary': 'URINARY',
  'kidney': 'KIDNEY',
  'liver': 'LIVER',
  'heart': 'HEART',
  'cardiac': 'CARDIAC',
  'respiratory': 'RESPIRATORY',
  'gastrointestinal': 'GASTROINTESTINAL',
  'neurological': 'NEUROLOGICAL',
  'psychological': 'PSYCHOLOGICAL',
  'mental': 'MENTAL',
  'depression': 'DEPRESSION',
  'anxiety': 'ANXIETY',
  'stress': 'STRESS',
  'insomnia': 'INSOMNIA',
  'sleep': 'SLEEP',
  'appetite': 'APPETITE',
  'weight': 'WEIGHT',
  'blood': 'BLOOD',
  'pressure': 'PRESSURE',
  'sugar': 'SUGAR',
  'cholesterol': 'CHOLESTEROL',
  'thyroid': 'THYROID',
  'hormone': 'HORMONE',
  'vitamin': 'VITAMIN',
  'deficiency': 'DEFICIENCY',
  'syndrome': 'SYNDROME',
  'disease': 'DISEASE',
  'disorder': 'DISORDER',
  'condition': 'CONDITION',
  'symptom': 'SYMPTOM',
  'sign': 'SIGN',
  'acute': 'ACUTE',
  'chronic': 'CHRONIC',
  'severe': 'SEVERE',
  'mild': 'MILD',
  'moderate': 'MODERATE',
  'recurrent': 'RECURRENT',
  'persistent': 'PERSISTENT',
  'temporary': 'TEMPORARY',
  'permanent': 'PERMANENT',
  'progressive': 'PROGRESSIVE',
  'stable': 'STABLE',
  'unstable': 'UNSTABLE',
  'critical': 'CRITICAL',
  'emergency': 'EMERGENCY',
  'urgent': 'URGENT',
  'routine': 'ROUTINE',
  'preventive': 'PREVENTIVE',
  'diagnostic': 'DIAGNOSTIC',
  'therapeutic': 'THERAPEUTIC',
  'surgical': 'SURGICAL',
  'medical': 'MEDICAL',
  'clinical': 'CLINICAL',
  'pathological': 'PATHOLOGICAL',
  'physiological': 'PHYSIOLOGICAL',
  'anatomical': 'ANATOMICAL',
  'functional': 'FUNCTIONAL',
  'structural': 'STRUCTURAL',
  'organic': 'ORGANIC',
  'systemic': 'SYSTEMIC',
  'local': 'LOCAL',
  'general': 'GENERAL',
  'specific': 'SPECIFIC',
  'nonspecific': 'NONSPECIFIC',
  'primary': 'PRIMARY',
  'secondary': 'SECONDARY',
  'tertiary': 'TERTIARY',
  'congenital': 'CONGENITAL',
  'acquired': 'ACQUIRED',
  'hereditary': 'HEREDITARY',
  'genetic': 'GENETIC',
  'environmental': 'ENVIRONMENTAL',
  'infectious': 'INFECTIOUS',
  'contagious': 'CONTAGIOUS',
  'viral': 'VIRAL',
  'bacterial': 'BACTERIAL',
  'fungal': 'FUNGAL',
  'parasitic': 'PARASITIC',
  'autoimmune': 'AUTOIMMUNE',
  'inflammatory': 'INFLAMMATORY',
  'degenerative': 'DEGENERATIVE',
  'malignant': 'MALIGNANT',
  'benign': 'BENIGN',
  'cancer': 'CANCER',
  'tumor': 'TUMOR',
  'tumour': 'TUMOR',
  'cyst': 'CYST',
  'polyp': 'POLYP',
  'lesion': 'LESION',
  'mass': 'MASS',
  'lump': 'LUMP',
  'nodule': 'NODULE',
  'growth': 'GROWTH',
  'abnormal': 'ABNORMAL',
  'normal': 'NORMAL',
  'healthy': 'HEALTHY',
  'unhealthy': 'UNHEALTHY',
  'positive': 'POSITIVE',
  'negative': 'NEGATIVE',
  'elevated': 'ELEVATED',
  'reduced': 'REDUCED',
  'increased': 'INCREASED',
  'decreased': 'DECREASED',
  'high': 'HIGH',
  'low': 'LOW',
  'normal': 'NORMAL',
  'abnormal': 'ABNORMAL'
};

// Function to correct and format medical text
export const correctAndFormatMedicalText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Split text into words
  const words = text.trim().split(/\s+/);
  
  // Process each word
  const correctedWords = words.map(word => {
    // Remove punctuation for lookup but keep it for final result
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    const punctuation = word.replace(/[\w]/g, '');
    
    // Check if word needs correction
    if (medicalCorrections[cleanWord]) {
      return medicalCorrections[cleanWord] + punctuation;
    }
    
    // If no correction found, convert to uppercase
    return word.toUpperCase();
  });
  
  return correctedWords.join(' ');
};

// Function to handle input change with auto-correction
export const handleMedicalTextInput = (value, setValue) => {
  // Don't correct while typing, only on blur or enter
  setValue(value);
};

// Function to apply correction on blur or enter
export const applyMedicalTextCorrection = (value, setValue) => {
  const corrected = correctAndFormatMedicalText(value);
  setValue(corrected);
  return corrected;
};

// Function to add medical term to corrections (for learning)
export const addMedicalCorrection = (incorrect, correct) => {
  medicalCorrections[incorrect.toLowerCase()] = correct.toUpperCase();
};

// Function to get suggestions for a partial word
export const getMedicalSuggestions = (partialWord) => {
  if (!partialWord || partialWord.length < 2) return [];
  
  const suggestions = [];
  const lowerPartial = partialWord.toLowerCase();
  
  Object.keys(medicalCorrections).forEach(key => {
    if (key.startsWith(lowerPartial)) {
      suggestions.push(medicalCorrections[key]);
    }
  });
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
};

export default {
  correctAndFormatMedicalText,
  handleMedicalTextInput,
  applyMedicalTextCorrection,
  addMedicalCorrection,
  getMedicalSuggestions
};
