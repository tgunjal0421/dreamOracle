import fs from 'fs';
import csv from 'csv-parser';
import natural from 'natural';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokenizer = new natural.WordTokenizer();
const csvPath = path.join(__dirname, 'https://drive.google.com/file/d/1IQ12eZ97LmN1V2GDOP64wMXEfTQCB0ab/view?usp=sharing');

// Store interpretations in memory for faster lookup
let dreamSymbols = new Map();

// Load dream interpretations from CSV
export const loadDreamSymbols = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({
        headers: ['Dream Symbol', 'Interpretation'],
        skipLines: 1 // Skip header row
      }))
      .on('data', (row) => {
        if (row['Dream Symbol'] && row['Interpretation']) {
          dreamSymbols.set(row['Dream Symbol'].toLowerCase(), row['Interpretation']);
        }
      })
      .on('end', () => {
        console.log('Dream symbols loaded successfully');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error loading dream symbols:', error);
        reject(error);
      });
  });
};

// Find relevant symbols in the dream text
const findRelevantSymbols = (dreamText) => {
  const dreamTextLower = dreamText.toLowerCase();
  const relevantSymbols = new Map();

  // Sort symbols by length (longest first) to match multi-word symbols before single words
  const sortedSymbols = Array.from(dreamSymbols.keys()).sort((a, b) => b.length - a.length);

  // Find all matching symbols in the dream text
  for (const symbol of sortedSymbols) {
    if (dreamTextLower.includes(symbol)) {
      relevantSymbols.set(symbol, dreamSymbols.get(symbol));
    }
  }

  return relevantSymbols;
};

// Paraphrase and combine interpretations
const paraphraseInterpretation = (symbols) => {
  let interpretation = "Dream Analysis:\n\n";
  
  // Add symbols and their meanings
  interpretation += "1. Key Symbols Found:\n";
  symbols.forEach((meaning, symbol) => {
    interpretation += `• ${symbol.charAt(0).toUpperCase() + symbol.slice(1)}: ${meaning}\n`;
  });

  // Add emotional analysis
  interpretation += "\n2. Emotional Analysis:\n";
  interpretation += "Based on the symbols in your dream, this dream might reflect:\n";
  
  // Group similar themes
  const themes = new Set();
  symbols.forEach((meaning) => {
    // Extract key themes using natural language processing
    const tokens = tokenizer.tokenize(meaning.toLowerCase());
    const emotions = tokens.filter(word => 
      ['fear', 'joy', 'anxiety', 'hope', 'worry', 'peace', 'conflict', 'desire'].includes(word)
    );
    emotions.forEach(emotion => themes.add(emotion));
  });

  themes.forEach(theme => {
    interpretation += `• Feelings of ${theme}\n`;
  });

  // Add guidance
  interpretation += "\n3. Guidance:\n";
  interpretation += "Consider reflecting on:\n";
  symbols.forEach((meaning, symbol) => {
    interpretation += `• How the symbol "${symbol}" might relate to your current life situation\n`;
  });

  return interpretation;
};

export const interpretDream = async (dreamText) => {
  try {
    if (dreamSymbols.size === 0) {
      console.log('Loading dream symbols...');
      await loadDreamSymbols();
      console.log(`Loaded ${dreamSymbols.size} dream symbols`);
    }

    console.log('Finding relevant symbols for dream text:', dreamText);
    const relevantSymbols = findRelevantSymbols(dreamText);
    console.log('Found symbols:', Array.from(relevantSymbols.keys()));
    
    if (relevantSymbols.size === 0) {
      console.log('No symbols found in the dream text');
      return {
        interpretation: "I couldn't find any specific symbols in your dream to interpret. Please try providing more details or using different words to describe your dream.",
        symbols: []
      };
    }

    console.log('Generating interpretation...');
    const interpretation = paraphraseInterpretation(relevantSymbols);
    
    const result = {
      interpretation,
      symbols: Array.from(relevantSymbols.keys())
    };
    
    console.log('Interpretation generated successfully');
    return result;
  } catch (error) {
    console.error('Error in interpretDream:', error);
    throw new Error('Failed to interpret dream: ' + error.message);
  }
};
