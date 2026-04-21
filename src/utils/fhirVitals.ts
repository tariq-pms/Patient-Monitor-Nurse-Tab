export interface VitalsData {
  hr?: string | number;
  pr?: string | number;
  rr?: string | number;
  spo2?: string | number;
  temp?: string | number;
  skinTemp?: string | number;
  coreTemp?: string | number;
  bp?: string;
  [key: string]: any;
}

/**
 * Saves vitals into a single unified Observation(category=vital-signs)
 * Uses the precise LOINC codes and display strings required by Trends1.
 */
export const saveVitalsToFHIR = async (patientId: string, vitals: VitalsData) => {
  const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
  const authHeaders = {
    Authorization: "Basic " + btoa("fhiruser:change-password"),
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
  };

  // 1. Search for existing vital-signs Observation
  const searchUrl = `${baseUrl}/Observation?subject=Patient/${patientId}&category=vital-signs&_sort=-date&_count=1`;
  let existingObservationId: string | null = null;
  
  try {
    const searchResponse = await fetch(searchUrl, { headers: authHeaders });
    if (searchResponse.ok) {
      const text = await searchResponse.text();
      if (text.trim()) {
        const result = JSON.parse(text);
        if (result.entry?.length > 0) {
          existingObservationId = result.entry[0].resource.id;
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ vital-signs Observation search failed:", error);
  }

  // 2. Build the components array using standard LOINC mappings for Trends
  const components: any[] = [];
  
  const addVital = (
    code: string,
    display: string,
    value: any,
    unit: string,
    systemCode: string
  ) => {
    if (value !== undefined && value !== null && value !== "") {
      components.push({
        code: {
          coding: [{ system: "http://loinc.org", code, display }],
          text: display,
        },
        valueQuantity: {
          value: parseFloat(String(value)),
          unit,
          system: "http://unitsofmeasure.org",
          code: systemCode,
        },
      });
    }
  };

  addVital("8867-4", "Heart Rate", vitals.hr, "BPM", "BPM");
  addVital("8888-4", "Pulse Rate", vitals.pr, "BPM", "BPM");
  addVital("9279-1", "Respiratory Rate", vitals.rr, "BPM", "BPM");
  addVital("20564-1", "SpO₂", vitals.spo2, "%", "%");
  
  // If temp is provided, use Skin Temperature mapping to guarantee Trends1 picks it up
  if (vitals.temp !== undefined) {
      addVital("60839-8", "Skin Temperature", vitals.temp, "°C", "°C");
  } else {
      addVital("60839-8", "Skin Temperature", vitals.skinTemp, "°C", "°C");
  }
  
  addVital("60839-8", "Core Temperature", vitals.coreTemp, "°C", "°C");

  // BP split
  if (vitals.bp) {
    const [sys, dia] = vitals.bp.split("/").map((v: string) => v.trim());
    if (sys && dia) {
      addVital("8480-6", "Systolic BP", sys, "mm[Hg]", "mm[Hg]");
      addVital("8462-4", "Diastolic BP", dia, "mm[Hg]", "mm[Hg]");
    }
  }

  // 📝 Custom Observation Fields (from Trends1)
  const addObs = (field: string, label: string, value: any) => {
    if (value) {
      components.push({
        code: {
          coding: [{ system: "http://hospital.local/observation", code: field, display: label }],
          text: label,
        },
        valueString: value,
      });
    }
  };

  if (vitals.observation) {
      addObs("grunting", "Grunting", vitals.observation.grunting);
      addObs("colour", "Colour", vitals.observation.colour);
      addObs("neuro", "Neuro", vitals.observation.neuro);
      addObs("feeding", "Feeding", vitals.observation.feeding);
      addObs("glucose", "Glucose", vitals.observation.glucose);
      addObs("parentalConcerns", "Parental Concerns", vitals.observation.parentalConcerns);
  }
  
  if (vitals.relatedText) {
      addObs("relatedText", "Other Related Notes", vitals.relatedText);
  }

  if (components.length === 0) return null; // No point saving if no vitals provided

  // 3. Create or Update Observation
  const requestBody: any = {
    resourceType: "Observation",
    status: "final",
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: "vital-signs",
        display: "Vital Signs",
      }]
    }],
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "85353-1",
        display: "Vital signs panel",
      }],
      text: "Vital signs panel",
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: new Date().toISOString(),
    component: components,
  };

  if (existingObservationId) {
    requestBody.id = existingObservationId;
  }

  const url = existingObservationId
    ? `${baseUrl}/Observation/${existingObservationId}`
    : `${baseUrl}/Observation`;

  const response = await fetch(url, {
    method: existingObservationId ? "PUT" : "POST",
    headers: authHeaders,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save vitals: ${text}`);
  }

  const savedData = await response.json().catch(() => ({}));

  // Return the ID of the observation and the data
  let finalId = existingObservationId || savedData.id;

  // Fallback ID extraction from headers if id wasn't in response body for POST
  if (!finalId && !existingObservationId) {
      const location = response.headers.get("Location") || response.headers.get("Content-Location");
      if (location) {
          const match = location.match(/Observation\/([^/]+)/);
          if (match) finalId = match[1];
      }
  }

  return finalId;
};
