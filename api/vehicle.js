// api/vehicle.js - Vercel Serverless Function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rc } = req.query;
  
  if (!rc || rc.length < 5) {
    return res.status(400).json({ error: 'Invalid RC number. Must be at least 5 characters.' });
  }

  const API_URL = `https://akash-vehicle-info-api.vercel.app/?rc=${encodeURIComponent(rc)}&key=AKASH_PARMA`;
  
  try {
    console.log(`[Vercel Function] Fetching: ${API_URL}`);
    
    const response = await fetch(API_URL, {
      headers: {
        'User-Agent': 'Vercel-Function/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if vehicle exists
    if (!data.identity_matrix_secure || !data.identity_matrix_secure.rc_number) {
      return res.status(404).json({ error: 'Vehicle not found. Please check RC number.' });
    }
    
    console.log(`[Vercel Function] Successfully fetched data for RC: ${rc}`);
    return res.status(200).json(data);
    
  } catch (error) {
    console.error(`[Vercel Function] Error: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle data from external API',
      details: error.message 
    });
  }
}
