import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://192.168.0.139:5175'); // Replace with your frontend origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Private-Network', 'true'); // ✅ Key fix for Private Network Access

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
const structuredPath = path.join(__dirname, 'public', 'neofax_structured_guidelines.json');
const guidelines = JSON.parse(fs.readFileSync(structuredPath));

function normalizeRoute(route) {
  const synonyms = { iv: "intravenous", im: "intramuscular", sc: "subcutaneous" };
  return synonyms[route.toLowerCase()] || route.toLowerCase();
}

function routeMatches(routeQuery, regimenRoute) {
  if (!regimenRoute) return true;
  return normalizeRoute(routeQuery).includes(regimenRoute.toLowerCase()) ||
         regimenRoute.toLowerCase().includes(normalizeRoute(routeQuery));
}
app.get('/drugs', (req, res) => {
  const drugNames = guidelines.map(d => d.drug_name).sort();
  res.json(drugNames);
});

function populationMatches(isPreterm, regimenPop) {
  if (!regimenPop) return true;
  return (regimenPop.toLowerCase() === 'preterm') === isPreterm;
}

function gestationalAgeMatches(ga, range) {
  if (!range) return true;
  const { min_weeks, max_weeks } = range;
  return (!min_weeks || ga >= min_weeks) && (!max_weeks || ga <= max_weeks);
}

function computeDose(regimen, weight) {
  const { dose_value, dose_unit, per_time, frequency } = regimen;
  if (!dose_value || !dose_unit) return null;

  let dosePerKgMg = dose_unit.toLowerCase().startsWith('mcg') ? dose_value / 1000 : dose_value;

  const result = {
    dose_per_dose_mg: dosePerKgMg * weight,
    dose_per_kg_mg: dosePerKgMg,
    unit_description: dose_unit,
    frequency: frequency || null
  };

  if (per_time === 'minute' || per_time === 'min') {
    result.dose_rate_mg_per_min = dosePerKgMg * weight;
  } else if (per_time === 'hour' || per_time === 'hr') {
    result.dose_rate_mg_per_hr = dosePerKgMg * weight;
  } else if (per_time === 'day') {
    result.dose_per_day_mg = dosePerKgMg * weight;
  }

  return result;
}

function selectBestRegimen(regimens, route, ga, isPreterm) {
  return regimens.find(reg =>
    routeMatches(route, reg.route) &&
    populationMatches(isPreterm, reg.population) &&
    gestationalAgeMatches(ga, reg.gestational_age_range)
  );
}

app.post('/calculate', (req, res) => {
  const { drug_name, weight, gestational_age, is_preterm, route } = req.body;
  const drugData = guidelines.find(d => d.drug_name.toLowerCase() === drug_name.toLowerCase());

  if (!drugData) return res.status(404).json({ error: 'Drug not found.' });

  const regimen = selectBestRegimen(drugData.regimens, route, gestational_age, is_preterm);
  if (!regimen) return res.status(404).json({ error: 'No suitable regimen found.' });

  const doseResult = computeDose(regimen, weight);

  res.json({
    drug_name,
    regimen: regimen.raw_text,
    calculation: doseResult,
    dose_adjustments: drugData.dose_adjustments,
    administration: drugData.administration,
    uses: drugData.uses,
    contraindications_precautions: drugData.contraindications_precautions
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Drug calculator API running on http://localhost:${PORT}`);
});
 

