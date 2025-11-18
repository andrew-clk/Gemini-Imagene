
import React, { useState } from 'react';
import { ImageFile } from '../types';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { generateImage } from '../services/geminiService';
import { SparklesIcon, DownloadIcon, WandIcon } from './Icons';

interface StyleTransferEditorProps {
  title: string;
  description: string;
  promptPlaceholder: string;
}

const base64FromDataUrl = (dataUrl: string): string => dataUrl.split(',')[1];

const StyleTransferEditor: React.FC<StyleTransferEditorProps> = ({ title, description, promptPlaceholder }) => {
  const [prompt, setPrompt] = useState('');
  const [contentFile, setContentFile] = useState<ImageFile[]>([]);
  const [styleFile, setStyleFile] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (contentFile.length === 0 || styleFile.length === 0 || !prompt) {
      setError('Please upload a content image, a style image, and provide a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const images = [
        {
          base64Data: base64FromDataUrl(contentFile[0].dataUrl),
          mimeType: contentFile[0].mimeType,
        },
        {
          base64Data: base64FromDataUrl(styleFile[0].dataUrl),
          mimeType: styleFile[0].mimeType,
        }
      ];

      const result = await generateImage(prompt, images);
      setGeneratedImage(result);

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `gemini-styled-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditFurther = () => {
    if (!generatedImage) return;
    
    const newImageFile: ImageFile = {
      name: `generated-${Date.now()}.png`,
      dataUrl: generatedImage,
      mimeType: generatedImage.match(/data:([^;]+);/)?.[1] || 'image/png',
    };

    setContentFile([newImageFile]);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-1">{description}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              1. Content Image (The image to change)
            </label>
            <ImageUploader id="content-file-upload" files={contentFile} onFilesChange={setContentFile} maxFiles={1} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              2. Style Reference (The style to apply)
            </label>
            <ImageUploader id="style-file-upload" files={styleFile} onFilesChange={setStyleFile} maxFiles={1} />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              3. Prompt
            </label>
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={promptPlaceholder}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || contentFile.length === 0 || styleFile.length === 0 || !prompt}
          className="w-full flex justify-center items-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate
            </>
          )}
        </button>
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-2">Result</h3>
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-4 border-2 border-dashed border-gray-700 min-h-[300px] lg:min-h-0">
          {isLoading && (
             <div className="text-center text-gray-400">
                <Spinner />
                <p className="mt-2">Generating your image...</p>
                <p className="text-sm text-gray-500">This might take a moment.</p>
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {generatedImage && (
            <div className="w-full h-full flex flex-col items-center gap-4">
              <div className="flex-grow w-full relative">
                <img src={generatedImage} alt="Generated result" className="w-full h-full object-contain rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download
                </button>
                <button 
                  onClick={handleEditFurther}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <WandIcon className="w-5 h-5" />
                  Edit Further
                </button>
              </div>
            </div>
          )}
          {!isLoading && !error && !generatedImage && (
             <p className="text-gray-500">Your generated image will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleTransferEditor;
