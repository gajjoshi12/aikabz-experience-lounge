module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({
    inboundPhoneNumber: process.env.INBOUND_PHONE_NUMBER || '+1234567890'
  });
};
