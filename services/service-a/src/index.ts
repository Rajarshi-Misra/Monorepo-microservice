import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  const instruction = req.body;

  try {
    const response = await axios.post('http://localhost:4001/receive', instruction);
    return res.status(200).json({
      status: 'Message sent to Service B',
      serviceBResponse: response.data
    });
  } catch (error: any) {
    console.error('Error calling Service B:', error.message);
    return res.status(500).json({ error: 'Service B not reachable' });
  }
});

app.listen(4000, () => {
  console.log('Service A listening on port 4000');
});
