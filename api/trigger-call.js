const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ success: false, error: 'Phone number is required' });

  const { VAPI_PRIVATE_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID } = process.env;
  if (!VAPI_PRIVATE_API_KEY || !VAPI_ASSISTANT_ID) {
    return res.status(500).json({ success: false, error: 'Vapi is not configured' });
  }

  try {
    const payload = {
      assistantId: VAPI_ASSISTANT_ID,
      customer: { number: phoneNumber }
    };
    if (VAPI_PHONE_NUMBER_ID) payload.phoneNumberId = VAPI_PHONE_NUMBER_ID;

    const response = await axios.post('https://api.vapi.ai/call', payload, {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json({ success: true, message: 'Call initiated successfully', data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to initiate the call' });
  }
};
