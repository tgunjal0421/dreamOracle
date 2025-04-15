import { interpretDream as interpretDreamFromService, loadDreamSymbols } from '../dream_service/dreamInterpreter.js';
import { Dream } from '../models/dreamModel.js';

// Initialize dream symbols
loadDreamSymbols().catch(console.error);

// Get dream interpretation using local interpretation service
const interpretDream = async (req, res) => {
  try {
    const { dream_text } = req.body;
    const userId = req.auth.userId || req.auth.sub;

    if (!dream_text) {
      return res.status(400).json({ error: 'Dream text is required' });
    }

    if (typeof dream_text !== 'string') {
      return res.status(400).json({ error: 'Dream text must be a string' });
    }

    const { interpretation, symbols } = await interpretDreamFromService(dream_text);

    // Save to database with user reference
    const newDream = await Dream.create({
      userId,
      dream: dream_text,
      interpretation,
      rawResponse: { symbols }
    });

    res.json({
      dream: dream_text,
      interpretation,
      id: newDream._id
    });
  } catch (error) {
    console.error('Dream interpretation error:', error);
    res.status(500).json({ error: 'Failed to interpret dream' });
  }
};

// Get user's dream history
const getDreamHistory = async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.sub;
    console.log('Fetching dreams for user:', userId);
    
    const dreams = await Dream.find({ userId })
      .sort({ createdAt: -1 })
      .select('dream interpretation createdAt');
    
    console.log('Found dreams:', dreams);
    res.json({ dreams });
  } catch (error) {
    console.error('Get dream history error:', error);
    res.status(500).json({ error: 'Failed to fetch dream history' });
  }
};

// Delete a dream interpretation
const deleteDream = async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.sub;
    console.log('Attempting to delete dream:', req.params.id, 'for user:', userId);

    const dream = await Dream.findOne({
      _id: req.params.id,
      userId
    });

    if (!dream) {
      console.log('Dream not found or unauthorized');
      return res.status(404).json({ error: 'Dream interpretation not found' });
    }

    await dream.deleteOne();
    console.log('Dream deleted successfully');
    res.json({ message: 'Dream interpretation deleted successfully' });
  } catch (error) {
    console.error('Delete dream error:', error);
    res.status(500).json({ error: 'Failed to delete dream interpretation' });
  }
};

export {
  interpretDream as interpretDreamHandler,
  getDreamHistory,
  deleteDream
};
