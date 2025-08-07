import { useState, useEffect } from 'react';
import axios from 'axios';

function DrugCalculator() {
  const [form, setForm] = useState({
    drug_name: '',
    weight: '',
    gestational_age: '',
    is_preterm: false,
    route: ''
  });
  const [drugs, setDrugs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://192.168.0.139:4000/drugs')
      .then(res => setDrugs(res.data))
      .catch(err => {
        console.error('Failed to fetch drugs list:', err);
        setDrugs([]);
      });
  }, []);
  

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://192.168.0.139:4000/calculate', form);

      setResult(res.data);
      setError('');
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.error || 'Calculation failed');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      {/* <h2>NeoFax Drug Dose Calculator</h2> */}
      <form onSubmit={handleSubmit}>
        <label>Drug:
          <select value={form.drug_name} onChange={e => setForm({ ...form, drug_name: e.target.value })}>
            <option value="">-- Select --</option>
            {drugs.map(drug => <option key={drug} value={drug}>{drug}</option>)}
          </select>
        </label><br /><br />
        <label>Weight (kg):
          <input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
        </label><br /><br />
        <label>Gestational Age (weeks):
          <input type="number" step="0.1" value={form.gestational_age} onChange={e => setForm({ ...form, gestational_age: e.target.value })} />
        </label><br /><br />
        <label>Preterm:
          <input type="checkbox" checked={form.is_preterm} onChange={e => setForm({ ...form, is_preterm: e.target.checked })} />
        </label><br /><br />
        <label>Route:
          <input type="text" value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} />
        </label><br /><br />
        <button type="submit">Calculate</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Dosing Result</h3>
          <p><strong>Regimen:</strong> {result.regimen}</p>
          {result.calculation ? (
            <>
              <p><strong>Per Dose:</strong> {result.calculation.dose_per_dose_mg?.toFixed(2)} mg</p>
              {result.calculation.dose_rate_mg_per_hr && <p><strong>Rate:</strong> {result.calculation.dose_rate_mg_per_hr.toFixed(2)} mg/hr</p>}
            </>
          ) : (
            <p>Unable to compute a numeric dose.</p>
          )}
          {result.administration && <p><strong>Administration:</strong> {result.administration}</p>}
          {result.uses && <p><strong>Uses:</strong> {result.uses}</p>}
          {result.dose_adjustments && <p><strong>Adjustments:</strong> {result.dose_adjustments}</p>}
        </div>
      )}
    </div>
  );
}

export default DrugCalculator;
