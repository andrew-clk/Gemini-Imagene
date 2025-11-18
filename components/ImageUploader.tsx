
import React, { useState, useCallback, ChangeEvent } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, XIcon } from './Icons';

interface ImageUploaderProps {
  id: string;
  files: ImageFile[];
  onFilesChange: (files: ImageFile[]) => void;
  maxFiles: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, files, onFilesChange, maxFiles }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const filePromises: Promise<ImageFile>[] = [];

    for (let i = 0; i < selectedFiles.length && (files.length + filePromises.length) < maxFiles; i++) {
      const file = selectedFiles[i];
      if (file.type.startsWith('image/')) {
        const promise = new Promise<ImageFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              dataUrl: e.target?.result as string,
              mimeType: file.type,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        filePromises.push(promise);
      }
    }

    if (filePromises.length > 0) {
      Promise.all(filePromises).then(resolvedFiles => {
        const updatedFiles = [...files, ...resolvedFiles];
        onFilesChange(updatedFiles);
      });
    }
  }, [files, maxFiles, onFilesChange]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };
  
  const removeImage = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${dragOver ? 'border-indigo-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'}`}
      >
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-400">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          <p className="text-xs text-gray-500">
            {files.length} / {maxFiles} files selected
          </p>
        </div>
      </label>
      <input id={id} name={id} type="file" className="sr-only" multiple={maxFiles > 1} accept="image/*" onChange={onInputChange} />

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover rounded-lg shadow-md" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                  aria-label="Remove image"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
