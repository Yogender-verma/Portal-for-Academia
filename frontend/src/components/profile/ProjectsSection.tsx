import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { ProjectItem } from '../../types/profile';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { FolderGit2, Plus, Edit2, Trash2, ExternalLink, Code2, Rocket, X, Save, Code } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const { profile, addProject, updateProject, deleteProject } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>({
    projectName: '',
    description: '',
    technologies: [],
    role: '',
    githubUrl: '',
    liveDemoUrl: '',
    skillsDemonstrated: [],
    thumbnailUrl: '',
  });

  const [techInput, setTechInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      projectName: '',
      description: '',
      technologies: [],
      role: '',
      githubUrl: '',
      liveDemoUrl: '',
      skillsDemonstrated: [],
      thumbnailUrl: '',
    });
    setTechInput('');
    setSkillsInput('');
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: ProjectItem) => {
    setEditingProject(proj);
    setFormData({
      projectName: proj.projectName,
      description: proj.description,
      technologies: proj.technologies,
      role: proj.role,
      githubUrl: proj.githubUrl || '',
      liveDemoUrl: proj.liveDemoUrl || '',
      skillsDemonstrated: proj.skillsDemonstrated,
      thumbnailUrl: proj.thumbnailUrl || '',
    });
    setTechInput(proj.technologies.join(', '));
    setSkillsInput(proj.skillsDemonstrated.join(', '));
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.projectName.trim()) errs.projectName = 'Project Name is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';

    const urlPattern = /^(https?:\/\/)?([\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/;
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      errs.githubUrl = 'Please enter a valid GitHub URL.';
    }
    if (formData.liveDemoUrl && !urlPattern.test(formData.liveDemoUrl)) {
      errs.liveDemoUrl = 'Please enter a valid Live Demo URL.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const projectData = {
      ...formData,
      technologies: parsedTech.length > 0 ? parsedTech : formData.technologies,
      skillsDemonstrated: parsedSkills.length > 0 ? parsedSkills : formData.skillsDemonstrated,
    };

    if (editingProject) {
      await updateProject(editingProject.id, projectData);
    } else {
      await addProject(projectData);
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteProject(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Projects & Portfolio</h2>
            <p className="text-xs text-slate-400">Practical applications built, code repositories & live demos</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Projects List */}
      {profile.projects.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No projects added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your first project to showcase your practical coding skills to potential employers.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between transition-all group"
            >
              {project.thumbnailUrl && (
                <div className="h-40 w-full bg-slate-900 overflow-hidden relative">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.projectName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                        {project.projectName}
                      </h3>
                      {project.role && <p className="text-xs text-cyan-400 font-medium">{project.role}</p>}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="text-slate-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-800"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete(project.id, project.projectName)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{project.description}</p>

                  {/* Technologies tags */}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <Code2 className="w-3 h-3 text-cyan-400" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* External links footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      <Code className="w-3.5 h-3.5" /> Repository
                    </a>
                  )}
                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 rounded-lg border border-cyan-800/50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g. SkillBridge AI Portal"
                    className={`w-full bg-slate-950 border ${
                      errors.projectName ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500`}
                  />
                  {errors.projectName && <p className="text-xs text-rose-400 mt-1">{errors.projectName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Developer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={formData.thumbnailUrl || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Description *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what this project does and key features implemented..."
                    className={`w-full bg-slate-950 border ${
                      errors.description ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500`}
                  />
                  {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className={`w-full bg-slate-950 border ${
                      errors.githubUrl ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500`}
                  />
                  {errors.githubUrl && <p className="text-xs text-rose-400 mt-1">{errors.githubUrl}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Live Demo URL</label>
                  <input
                    type="text"
                    value={formData.liveDemoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                    placeholder="https://project.vercel.app"
                    className={`w-full bg-slate-950 border ${
                      errors.liveDemoUrl ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500`}
                  />
                  {errors.liveDemoUrl && <p className="text-xs text-rose-400 mt-1">{errors.liveDemoUrl}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" /> Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Project"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
