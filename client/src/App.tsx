import { useState, useEffect } from 'react';
import { StyleSelector } from './components/StyleSelector';
import { ColorInput } from './components/ColorInput';
import { IconGrid } from './components/IconGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchStyles, generateIcons } from './api';
import { StylePreset, GenerateResponse } from './types';
import './App.css';

function App() {
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  useEffect(() => {
    fetchStyles()
      .then(setStyles)
      .catch((err) => {
        console.error('Failed to fetch styles:', err);
        setError('Failed to load styles. Please refresh the page.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!selectedStyle) {
      setError('Please select a style');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateIcons(prompt, selectedStyle, colors);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate icons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Icon Set Generator</h1>
        <p>Generate 4 consistent icons from a single prompt</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-group">
            <label htmlFor="prompt">Prompt for Icon Set</label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "Toys", "Food", "Travel"'
              disabled={loading}
              className="prompt-input"
            />
          </div>

          <StyleSelector
            styles={styles}
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            disabled={loading}
          />

          <ColorInput
            colors={colors}
            onChange={setColors}
            disabled={loading}
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !prompt.trim() || !selectedStyle}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Icons'}
          </button>
        </form>

        {loading && <LoadingSpinner />}

        {result && !loading && (
          <IconGrid
            images={result.images}
            prompt={result.prompt}
            style={result.style}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Flux-schnell via Replicate</p>
      </footer>
    </div>
  );
}

export default App;
