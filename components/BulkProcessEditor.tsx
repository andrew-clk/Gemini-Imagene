import React, { useState } from 'react';
import { ImageFile } from '../types';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { generateImage } from '../services/geminiService';
import { SparklesIcon, DownloadIcon } from './Icons';

interface BulkProcessEditorProps {
  title: string;
  description: string;
  maxFiles: number;
  promptPlaceholder: string;
}

const base64FromDataUrl = (dataUrl: string): string => dataUrl.split(',')[1];

const BulkProcessEditor: React.FC<BulkProcessEditorProps> = ({ title, description, maxFiles, promptPlaceholder }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (imageFiles.length === 0 || !prompt) {
      setError('Please upload at least one image and provide a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const imageGenerationPromises = imageFiles.map(file => {
        const image = {
          base64Data: base64FromDataUrl(file.dataUrl),
          mimeType: file.mimeType,
        };
        // Each image is processed individually with the same prompt
        return generateImage(prompt, [image]);
      });

      const results = await Promise.all(imageGenerationPromises);
      setGeneratedImages(results);

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during bulk processing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `gemini-bulk-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-1">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
              Upload Images
            </label>
            <ImageUploader id="image-upload" files={imageFiles} onFilesChange={setImageFiles} maxFiles={maxFiles} />
          </div>

          <div className="space-y-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt for all images
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={promptPlaceholder}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || imageFiles.length === 0 || !prompt}
          className="w-full flex justify-center items-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              {`Generate ${imageFiles.length > 0 ? imageFiles.length : ''} Image(s)`}
            </>
          )}
        </button>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-4 border-2 border-dashed border-gray-700 min-h-[200px]">
          {isLoading && (
             <div className="text-center text-gray-400">
                <Spinner />
                <p className="mt-2">Processing {imageFiles.length} images...</p>
                <p className="text-sm text-gray-500">This might take a while.</p>
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          
          {!isLoading && generatedImages.length > 0 && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedImages.map((imgSrc, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img src={imgSrc} alt={`Generated result ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                            <button
                                onClick={() => handleDownload(imgSrc, index)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-sm focus:outline-none"
                                aria-label="Download image"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          )}

          {!isLoading && !error && generatedImages.length === 0 && (
             <p className="text-gray-500">Your generated images will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkProcessEditor;