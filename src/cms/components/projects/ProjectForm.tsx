import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import Button from "../../../components/ui/Button";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import ProjectBasicInfo from "./ProjectBasicInfo";
import ProjectContent from "./ProjectContent";
import ProjectImages from "./ProjectImages";
import ProjectLinks from "./ProjectLinks";
import ProjectSEO from "./ProjectSEO";
import ProjectPublishing from "./ProjectPublishing";

// Types
interface Project {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  summary?: string;
  thumbnail_url?: string;
  category_id?: string;
  technologies: string[];
  demo_url?: string;
  code_url?: string;
  case_study_url?: string;
  is_featured: boolean;
  display_order: number;
  status: "draft" | "published" | "archived";
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ProjectImage {
  id?: string;
  project_id?: string;
  image_url: string;
  alt_text: string;
  caption?: string;
  display_order: number;
}

interface ProjectFormProps {
  project?:
    | (Project & {
        category?: { id: string; name: string } | null;
        images?: ProjectImage[];
      })
    | null;
  categories: ProjectCategory[];
  isLoading: boolean;
  onCancel: () => void;
}

type FormTab = "basic" | "content" | "images" | "links" | "seo" | "publishing";

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  categories,
  isLoading,
  onCancel,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FormTab>("basic");
  const [formData, setFormData] = useState<Project>({
    title: "",
    slug: "",
    description: "",
    content: "",
    summary: "",
    thumbnail_url: "",
    category_id: "",
    technologies: [],
    demo_url: "",
    code_url: "",
    case_study_url: "",
    is_featured: false,
    display_order: 0,
    status: "draft",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (project) {
      setFormData({
        id: project.id,
        title: project.title || "",
        slug: project.slug || "",
        description: project.description || "",
        content: project.content || "",
        summary: project.summary || "",
        thumbnail_url: project.thumbnail_url || "",
        category_id: project.category_id || "",
        technologies: project.technologies || [],
        demo_url: project.demo_url || "",
        code_url: project.code_url || "",
        case_study_url: project.case_study_url || "",
        is_featured: project.is_featured || false,
        display_order: project.display_order || 0,
        status: project.status || "draft",
        published_at: project.published_at,
        meta_title: project.meta_title || "",
        meta_description: project.meta_description || "",
        meta_keywords: project.meta_keywords || "",
        created_at: project.created_at,
        updated_at: project.updated_at,
      });

      if (project.images && project.images.length > 0) {
        setProjectImages(project.images);
      }
    }
  }, [project]);

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (data: { project: Project; images: ProjectImage[] }) => {
      const { project, images } = data;

      // Format the project data
      const projectData = {
        title: project.title,
        slug: project.slug,
        description: project.description,
        content: project.content,
        summary: project.summary,
        thumbnail_url: project.thumbnail_url,
        category_id: project.category_id || null,
        technologies: project.technologies,
        demo_url: project.demo_url,
        code_url: project.code_url,
        case_study_url: project.case_study_url,
        is_featured: project.is_featured,
        display_order: project.display_order,
        status: project.status,
        published_at:
          project.status === "published"
            ? project.published_at || new Date().toISOString()
            : null,
        meta_title: project.meta_title,
        meta_description: project.meta_description,
        meta_keywords: project.meta_keywords,
      };

      let projectId = project.id;

      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update({
            ...projectData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new project
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert({
            ...projectData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        projectId = newProject.id;
      }

      // Handle project images
      if (projectId) {
        // First, remove all existing images that are not in the current list
        const currentImageIds = images
          .filter((img) => img.id)
          .map((img) => img.id);

        if (currentImageIds.length > 0) {
          const { error: deleteError } = await supabase
            .from("project_images")
            .delete()
            .eq("project_id", projectId)
            .not("id", "in", `(${currentImageIds.join(",")})`);

          if (deleteError) {
            throw new Error(deleteError.message);
          }
        } else {
          // If no images with IDs, delete all images for this project
          const { error: deleteAllError } = await supabase
            .from("project_images")
            .delete()
            .eq("project_id", projectId);

          if (deleteAllError) {
            throw new Error(deleteAllError.message);
          }
        }

        // Then, update or insert images
        for (const image of images) {
          if (image.id) {
            // Update existing image
            const { error: updateError } = await supabase
              .from("project_images")
              .update({
                image_url: image.image_url,
                alt_text: image.alt_text,
                caption: image.caption,
                display_order: image.display_order,
              })
              .eq("id", image.id);

            if (updateError) {
              throw new Error(updateError.message);
            }
          } else {
            // Insert new image
            const { error: insertError } = await supabase
              .from("project_images")
              .insert({
                project_id: projectId,
                image_url: image.image_url,
                alt_text: image.alt_text,
                caption: image.caption,
                display_order: image.display_order,
              });

            if (insertError) {
              throw new Error(insertError.message);
            }
          }
        }
      }

      return projectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      navigate("/admin/projects");
    },
  });

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
      .trim();
  };

  // Handle title change and auto-generate slug if empty
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      // Only auto-generate slug if it's empty or matches the previous auto-generated slug
      slug:
        !prev.slug || prev.slug === generateSlug(prev.title)
          ? generateSlug(title)
          : prev.slug,
    }));

    // Clear error when field is edited
    if (errors.title) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.title;
        return newErrors;
      });
    }
  };

  // Handle form input changes
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle project images changes
  const handleImagesChange = (images: ProjectImage[]) => {
    setProjectImages(images);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await saveProjectMutation.mutateAsync({
        project: formData,
        images: projectImages,
      });
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Ensure we navigate back to the projects list
    navigate("/admin/projects");
    onCancel();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {project ? "Edit Project" : "Create New Project"}
        </h2>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 overflow-x-auto">
        <div className="flex flex-nowrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeTab === "basic"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeTab === "content"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeTab === "images"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Images
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeTab === "links"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Links
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeTab === "seo"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            SEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publishing")}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeTab === "publishing"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Publishing
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {activeTab === "basic" && (
            <ProjectBasicInfo
              formData={formData}
              errors={errors}
              categories={categories}
              onTitleChange={handleTitleChange}
              onChange={handleChange}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          )}

          {activeTab === "content" && (
            <ProjectContent
              content={formData.content}
              error={errors.content}
              onChange={(content) => handleChange("content", content)}
            />
          )}

          {activeTab === "images" && (
            <ProjectImages
              images={projectImages}
              onChange={handleImagesChange}
              projectId={formData.id}
            />
          )}

          {activeTab === "links" && (
            <ProjectLinks formData={formData} onChange={handleChange} />
          )}

          {activeTab === "seo" && (
            <ProjectSEO formData={formData} onChange={handleChange} />
          )}

          {activeTab === "publishing" && (
            <ProjectPublishing formData={formData} onChange={handleChange} />
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saveProjectMutation.isPending}
          >
            {project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProjectForm;
