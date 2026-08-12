import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Zap, FolderOpen, Trash2, Copy, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load projects from localStorage for now (will connect to Supabase later)
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const createProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsCreating(true);
    try {
      const project: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProjectName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedProjects = [...projects, project];
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      setNewProjectName('');
      toast.success('Project created! Opening lab...');
      navigate(`/lab/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    toast.success('Project deleted');
  };

  const duplicateProject = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      name: `${project.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    toast.success('Project duplicated');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(var(--lab-dark))] to-[hsl(var(--lab-darker))] text-foreground">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[hsl(var(--lab-cyan))]" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name || profile?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Project Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <Card className="p-6 border-[hsl(var(--lab-cyan))]/20 bg-background/50">
            <div className="flex gap-3">
              <Input
                placeholder="Project name (e.g., 'LED Blink Circuit')"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createProject()}
                className="flex-1"
              />
              <Button
                onClick={createProject}
                disabled={isCreating}
                className="bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </Card>
        </section>

        {/* Projects Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <Card className="p-12 border-[hsl(var(--lab-cyan))]/20 bg-background/50 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No projects yet. Create one to get started!</p>
              <Button
                onClick={() => {
                  setNewProjectName('My First Circuit');
                  setTimeout(createProject, 0);
                }}
                className="bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="p-6 border-[hsl(var(--lab-cyan))]/20 bg-background/50 hover:border-[hsl(var(--lab-cyan))]/50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/lab/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <FolderOpen className="w-8 h-8 text-[hsl(var(--lab-cyan))] group-hover:text-[hsl(var(--lab-purple))] transition-colors" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateProject(project);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-[hsl(var(--lab-cyan))] transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-[hsl(var(--lab-cyan))]/20 bg-background/50">
            <h3 className="font-semibold mb-3">Quick Start</h3>
            <p className="text-sm text-muted-foreground mb-4">
              New to ElectroLab? Learn how to design your first circuit.
            </p>
            <Button variant="outline" className="w-full">
              View Tutorial
            </Button>
          </Card>
          <Card className="p-6 border-[hsl(var(--lab-purple))]/20 bg-background/50">
            <h3 className="font-semibold mb-3">Component Library</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse thousands of electronic components with specifications.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/components')}
            >
              Explore Components
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
}
