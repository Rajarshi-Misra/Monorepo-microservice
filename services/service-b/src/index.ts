import express from 'express';

const app = express();
app.use(express.json());

app.post('/receive', (req, res) => {
  const instruction = req.body;
  console.log('Service B received:', instruction);

  // Simulate some processing
  const result = {
    received: instruction,
    processedAt: new Date().toISOString()
  };

  return res.status(200).json(result);
});

app.listen(4001, () => {
  console.log('Service B listening on port 4001');
});
