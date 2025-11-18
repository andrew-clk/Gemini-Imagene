import React, { useState, useCallback } from 'react';
import { SparklesIcon, ScissorsIcon, LayersIcon, GithubIcon, BrushIcon, CopyIcon } from './components/Icons';
import ImageEditor from './components/ImageEditor';
import StyleTransferEditor from './components/StyleTransferEditor';
import BulkProcessEditor from './components/BulkProcessEditor';
import { EditorMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<EditorMode>(EditorMode.VARIATIONS);

  const TABS = [
    { id: EditorMode.VARIATIONS, name: 'Generate Variations', icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
    { id: EditorMode.MERGE, name: 'Merge Images', icon: <LayersIcon className="w-5 h-5 mr-2" /> },
    { id: EditorMode.EDIT, name: 'Edit Image', icon: <ScissorsIcon className="w-5 h-5 mr-2" /> },
    { id: EditorMode.STYLE_TRANSFER, name: 'Style Transfer', icon: <BrushIcon className="w-5 h-5 mr-2" /> },
    { id: EditorMode.BULK_PROCESS, name: 'Bulk Process', icon: <CopyIcon className="w-5 h-5 mr-2" /> },
  ];

  const getEditorConfig = useCallback((currentMode: EditorMode) => {
    switch (currentMode) {
      case EditorMode.VARIATIONS:
        return {
          title: "Generate Image Variations",
          description: "Upload a mascot or drawing to generate different postures or angles.",
          maxFiles: 1,
          promptPlaceholder: "e.g., a full body shot, in a fighting pose, pixel art style"
        };
      case EditorMode.MERGE:
        return {
          title: "Merge Image Elements",
          description: "Upload a few images to merge their elements into a new scene.",
          maxFiles: 5,
          promptPlaceholder: "e.g., a bear driving a car while holding a cup"
        };
      case EditorMode.EDIT:
        return {
          title: "Edit an Image",
          description: "Upload an image and use a prompt to add or remove elements.",
          maxFiles: 1,
          promptPlaceholder: "e.g., remove the person in the background, add a hat on the cat"
        };
      case EditorMode.STYLE_TRANSFER:
        return {
          title: "Transfer Image Style",
          description: "Apply the style of a reference image to a content image.",
          maxFiles: 1, // each uploader will have 1
          promptPlaceholder: "e.g., convert the content image to the style of the reference, make it a watercolor painting"
        };
      case EditorMode.BULK_PROCESS:
        return {
          title: "Bulk Image Processing",
          description: "Upload multiple images and apply the same prompt to all of them.",
          maxFiles: 20,
          promptPlaceholder: "e.g., apply a vintage photo filter, convert to cartoon style"
        };
      default:
        return {
          title: "",
          description: "",
          maxFiles: 1,
          promptPlaceholder: ""
        };
    }
  }, []);

  const config = getEditorConfig(mode);

  const renderEditor = () => {
    switch(mode) {
      case EditorMode.STYLE_TRANSFER:
        return <StyleTransferEditor
          key={mode}
          title={config.title}
          description={config.description}
          promptPlaceholder={config.promptPlaceholder}
        />;
      case EditorMode.BULK_PROCESS:
        return <BulkProcessEditor
          key={mode}
          title={config.title}
          description={config.description}
          maxFiles={config.maxFiles}
          promptPlaceholder={config.promptPlaceholder}
        />;
      default:
        return <ImageEditor
          key={mode} 
          title={config.title}
          description={config.description}
          maxFiles={config.maxFiles}
          promptPlaceholder={config.promptPlaceholder}
        />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <SparklesIcon className="w-7 h-7 mr-3 text-indigo-400" />
            Gemini Image Lab
          </h1>
          <a
            href="https://github.com/google/gemini-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap border-b border-gray-700">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex items-center justify-center px-4 py-3 font-semibold transition-colors duration-200 ease-in-out focus:outline-none ${
                  mode === tab.id
                    ? 'border-b-2 border-indigo-400 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        
        {renderEditor()}

      </main>

      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini. Not official Google product.</p>
      </footer>
    </div>
  );
};

export default App;