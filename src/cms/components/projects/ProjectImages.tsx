import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Types
interface ProjectImage {
  id?: string;
  project_id?: string;
  image_url: string;
  alt_text: string;
  caption?: string;
  display_order: number;
}

interface ProjectImagesProps {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  projectId?: string;
}

const ProjectImages: React.FC<ProjectImagesProps> = ({
  images,
  onChange,
  projectId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  // Handle file upload for project images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      const newImages: ProjectImage[] = [...images];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `project_${Math.random().toString(36).substring(2, 15)}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `project_images/${fileName}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);
        
        // Add new image to the list
        newImages.push({
          image_url: publicUrl,
          alt_text: file.name.split('.')[0].replace(/[_-]/g, ' '),
          display_order: newImages.length,
        });
      }
      
      // Update images state
      onChange(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // Update display order
    newImages.forEach((image, i) => {
      image.display_order = i;
    });
    
    onChange(newImages);
    
    if (currentImageIndex === index) {
      setCurrentImageIndex(null);
    } else if (currentImageIndex !== null && currentImageIndex > index) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Handle image field update
  const handleImageUpdate = (index: number, field: keyof ProjectImage, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange(newImages);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const newImages = [...images];
    const [movedItem] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, movedItem);
    
    // Update display order
    newImages.forEach((image, i) => {
      image.display_order = i;
    });
    
    onChange(newImages);
    
    if (currentImageIndex === result.source.index) {
      setCurrentImageIndex(result.destination.index);
    } else if (
      currentImageIndex !== null && 
      ((currentImageIndex > result.source.index && currentImageIndex <= result.destination.index) ||
       (currentImageIndex < result.source.index && currentImageIndex >= result.destination.index))
    ) {
      setCurrentImageIndex(
        currentImageIndex > result.source.index 
          ? currentImageIndex - 1 
          : currentImageIndex + 1
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Images
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Add images to showcase your project. You can upload multiple images at once.
          Drag and drop to reorder images. The first image will be used as the main image.
        </p>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
            <span>Upload Images</span>
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
          {isUploading && (
            <LoadingSpinner size="sm" text="Uploading..." />
          )}
        </div>
      </div>

      {images.length > 0 ? (
        <div className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="project-images">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {images.map((image, index) => (
                    <Draggable key={index} draggableId={`image-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Image Preview */}
                            <div className="w-full md:w-48 h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                              <img 
                                src={image.image_url} 
                                alt={image.alt_text}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Image Details */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mr-2 p-1 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Image {index + 1}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="mt-3 space-y-3">
                                <div>
                                  <label htmlFor={`alt-text-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Alt Text *
                                  </label>
                                  <input
                                    type="text"
                                    id={`alt-text-${index}`}
                                    value={image.alt_text}
                                    onChange={(e) => handleImageUpdate(index, 'alt_text', e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    placeholder="Descriptive text for accessibility"
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor={`caption-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Caption
                                  </label>
                                  <input
                                    type="text"
                                    id={`caption-${index}`}
                                    value={image.caption || ''}
                                    onChange={(e) => handleImageUpdate(index, 'caption', e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    placeholder="Optional caption for the image"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No images added</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload images to showcase your project
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectImages;
