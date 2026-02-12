import axios from 'axios';
import https from 'https';

// Basic authentication credentials
const AUTH_USERNAME = 'fhiruser';
const AUTH_PASSWORD = 'change-password';

// Axios instance with common configuration
const axiosInstance = axios.create({
    baseURL: 'https://pmsserver.local/fhir',
    httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Disable SSL verification
    auth: {
        username: AUTH_USERNAME,
        password: AUTH_PASSWORD,
    },
    headers: {
        'Content-Type': 'application/json',
    },
});

// Step 1: Fetch all Patient resources
async function fetchPatients() {
    try {
        const response = await axiosInstance.get('/Patient?_count=1000');
        return response.data.entry || [];
    } catch (error) {
        console.error('Error fetching patients:', error.response?.data || error.message);
        return [];
    }
}

// Step 2: Filter patients based on criteria
function filterPatients(patients) {
    return patients.filter(patient => {
        const resource = patient.resource;

        // Check if managingOrganization matches
        const managingOrgMatches =
            resource.managingOrganization?.reference === 'Organization/190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83';

        // Check if any extension has valueString "NOV2"
        const hasMatchingExtension =
            resource.extension?.some(ext => ext.valueString === 'W') || false;

        return managingOrgMatches && hasMatchingExtension;
    });
}

// Step 3: Prepare and send a batch delete request
async function deletePatients(filteredPatients) {
    const batchRequest = {
        resourceType: 'Bundle',
        type: 'batch',
        entry: filteredPatients.map(patient => ({
            request: {
                method: 'DELETE',
                url: `Patient/${patient.resource.id}`,
            },
        })),
    };

    try {
        const response = await axiosInstance.post('/', batchRequest);
        console.log('Batch deletion successful!', response.data);
    } catch (error) {
        console.error('Error deleting patients:', error.response?.data || error.message);
    }
}

// Main function
async function main() {
    console.log('Fetching patients...');
    const patients = await fetchPatients();

    console.log(`Total patients fetched: ${patients.length}`);
    const filteredPatients = filterPatients(patients);
    console.log(`Patients to delete: ${filteredPatients.length}`);

    if (filteredPatients.length > 0) {
        console.log('Deleting patients...');
        await deletePatients(filteredPatients);
    } else {
        console.log('No patients matched the criteria.');
    }
}

main().catch(err => console.error('Error in script:', err));
