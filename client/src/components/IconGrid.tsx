import { getProxyImageUrl } from '../api';
import './IconGrid.css';

interface IconGridProps {
  images: string[];
  prompt: string;
  style: string;
}

export function IconGrid({ images, prompt, style }: IconGridProps) {
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const proxyUrl = getProxyImageUrl(imageUrl);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.replace(/\s+/g, '-')}-icon-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(imageUrl, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < images.length; i++) {
      await handleDownload(images[i], i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  return (
    <div className="icon-grid-container">
      <div className="grid-header">
        <div className="grid-info">
          <h3>Generated Icons</h3>
          <p>Prompt: "{prompt}" | Style: {style}</p>
        </div>
        <button onClick={handleDownloadAll} className="download-all-btn">
          Download All
        </button>
      </div>

      <div className="icon-grid">
        {images.map((imageUrl, index) => (
          <div key={index} className="icon-card">
            <img
              src={imageUrl}
              alt={`${prompt} icon ${index + 1}`}
              className="icon-image"
            />
            <button
              onClick={() => handleDownload(imageUrl, index)}
              className="download-btn"
            >
              Download PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
