require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Twilio client (only if credentials exist to avoid crashing if empty)
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

app.post('/api/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    try {
        if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
            // Send OTP via Twilio Verify API
            await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verifications
                .create({ to: phoneNumber, channel: 'sms' });
                
            console.log(`Sent Twilio Verify OTP to ${phoneNumber}`);
            res.json({ success: true, message: 'OTP sent successfully via Twilio Verify' });
        } else {
            return res.status(500).json({ success: false, error: 'Twilio is not fully configured (missing Auth Token or Verify Service SID)' });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to send OTP. Please check your Twilio credentials.' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ success: false, error: 'Phone number and OTP are required' });
    }

    try {
        if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
            // Verify OTP via Twilio Verify API
            const verificationCheck = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verificationChecks
                .create({ to: phoneNumber, code: otp });

            if (verificationCheck.status === 'approved') {
                res.json({ success: true, message: 'OTP verified successfully' });
            } else {
                res.status(400).json({ success: false, error: 'Invalid OTP' });
            }
        } else {
            return res.status(500).json({ success: false, error: 'Twilio is not fully configured' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
});

app.post('/api/trigger-call', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    try {
        // Call the Vapi.ai API to initiate the outbound call
        const vapiApiKey = process.env.VAPI_PRIVATE_API_KEY;
        const vapiAssistantId = process.env.VAPI_ASSISTANT_ID;
        const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

        if (!vapiApiKey || !vapiAssistantId) {
            return res.status(500).json({ success: false, error: 'Vapi API configuration is missing on the server' });
        }

        const payload = {
            assistantId: vapiAssistantId,
            customer: {
                number: phoneNumber
            }
        };

        if (vapiPhoneNumberId) {
            payload.phoneNumberId = vapiPhoneNumberId;
        }

        const response = await axios.post(
            'https://api.vapi.ai/call',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${vapiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Vapi API response:', response.data);
        res.json({ success: true, message: 'Call initiated successfully', data: response.data });
    } catch (error) {
        console.error('Error calling Vapi API:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Failed to initiate the call' });
    }
});

app.get('/api/config', (req, res) => {
    // Send public config (like inbound phone number) to the frontend
    res.json({
        inboundPhoneNumber: process.env.INBOUND_PHONE_NUMBER || '+1234567890'
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
