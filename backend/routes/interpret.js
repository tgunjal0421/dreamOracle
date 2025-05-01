import express from 'express';
import axios from 'axios';
import { Dream } from '../models/dreamModel.js';
import { requireAuth, attachUser } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware
router.use(requireAuth);
router.use(attachUser);

// POST /api/interpret
router.post('/', async (req, res) => {
  try {
    const { dream } = req.body;
    if (!dream) {
      return res.status(400).json({ error: 'Dream text is required' });
    }

    const prompt = `Explain this dream: ${dream}`;

    let interpretation;
    let rawResponse;

    try {
        const response = await axios.post(
            'https://api.aimlapi.com/v1/chat/completions',
            {
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'user',
                  content: ` You are a professional dream interpreter. Explain this dream in engaging tone and brief point. 
                  Use many emojis. Do highlight anything in bold. Dream: "${dream}" `,
                },
              ],
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.AIML_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
      interpretation = response.data.choices?.[0]?.message?.content?.trim() || 'No interpretation returned.';
      rawResponse = response.data;
    } catch (apiErr) {
      console.error('AIMLAPI Error:', apiErr.response?.data || apiErr.message);
      interpretation =
        "Sorry, we're unable to interpret your dream at the moment.";
      rawResponse = {
        error: true,
        fallback: true,
        message: apiErr.response?.data?.message || apiErr.message,
      };
    }

    // Save to MongoDB
    const newDream = new Dream({
      dream,
      interpretation,
      rawResponse,
      userId: req.user._id,
    });

    await newDream.save();

    res.json({ interpretation, rawResponse });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({
      error: 'Failed to interpret dream',
      details: err.message,
    });
  }
});

// DELETE /api/interpret/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Dream.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ error: 'Dream interpretation not found' });
    }

    res.json({ message: 'Dream interpretation deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({
      error: 'Failed to delete dream',
      details: err.message,
    });
  }
});

// GET /api/interpret/history
router.get('/history', async (req, res) => {
  try {
    const dreams = await Dream.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(dreams);
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({
      error: 'Failed to fetch dream history',
      details: err.message,
    });
  }
});

export const interpretRoutes = router;
