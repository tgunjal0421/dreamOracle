import express from 'express';
import axios from 'axios';
import {Dream} from '../models/dreamModel.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { dream } = req.body;
        console.log('\n=== New Dream Symbol Request ===');
        console.log('Symbol received:', dream);

        const options = {
            method: 'POST',
            url: 'https://ai-dream-interpretation-dream-dictionary-dream-analysis.p.rapidapi.com/dreamDictionary',
            params: {
                noqueue: '1'
            },
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'ai-dream-interpretation-dream-dictionary-dream-analysis.p.rapidapi.com'
            },
            data: {
                symbol: dream,
                language: 'en'
            }
        };

        console.log('Sending request to RapidAPI...');

        const response = await axios.request(options);
        
        //console.log('\n=== API Response ===');
        //console.log('Status:', response.status);

        // Extract only the result data
        const cleanedResponse = response.data.result || {};
        //console.log('Cleaned response:', JSON.stringify(cleanedResponse, null, 2));

        const interpretation = cleanedResponse.generalMeaning || cleanedResponse.meaning || response.data.message;

        // Save to MongoDB
        const newDream = new Dream({
            dream,
            interpretation,
            rawResponse: cleanedResponse
        });
        await newDream.save();
        //console.log('\n=== Dream Saved to Database ===');
        //console.log('Dream Symbol:', dream);
        //console.log('Interpretation:', interpretation);
        //console.log('==============================\n');

        // Send back only the cleaned response
        res.json({ 
            interpretation,
            rawResponse: cleanedResponse
        });
    } catch (error) {
        console.error('\n=== Error Occurred ===');
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        console.error('====================\n');

        res.status(500).json({ 
            error: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
});

// Delete a dream interpretation
router.delete('/:id', async (req, res) => {
    try {
        console.log('\n=== Delete Dream Request ===');
        console.log('Dream ID:', req.params.id);
        
        const result = await Dream.findByIdAndDelete(req.params.id);
        
        if (!result) {
            console.log('Dream not found');
            return res.status(404).json({ error: 'Dream interpretation not found' });
        }
        
        console.log('Dream deleted successfully');
        console.log('=========================\n');
        
        res.json({ message: 'Dream interpretation deleted successfully' });
    } catch (error) {
        console.error('\n=== Error Deleting Dream ===');
        console.error(error.message);
        console.error('=========================\n');
        res.status(500).json({ error: error.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        console.log('\n=== Fetching Dream History ===');
        const dreams = await Dream.find().sort({ date: -1 });
        //console.log(`Found ${dreams.length} past dreams`);
        //console.log('===========================\n');
        res.json(dreams);
    } catch (error) {
        console.error('\n=== Error Fetching History ===');
        console.error(error.message);
        console.error('============================\n');
        res.status(500).json({ error: error.message });
    }
});

export const interpretRoutes = router;
