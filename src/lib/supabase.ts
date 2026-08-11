import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const auth = {
  async signUp(email: string, password: string, username: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data: data?.user, error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data: data?.session, error };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// User profile helpers
export const userProfiles = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async createProfile(userId: string, username: string, fullName?: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          username,
          full_name: fullName,
          role: 'user',
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },
};

// Component helpers
export const components = {
  async searchComponents(query: string, limit = 20, offset = 0) {
    if (!query.trim()) {
      const { data, error, count } = await supabase
        .from('components')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      return { data, error, count };
    }

    const { data, error, count } = await supabase
      .from('components')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .textSearch('search_vector', query, {
        type: 'websearch',
      })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    return { data, error, count };
  },

  async getComponentById(id: string) {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    return { data, error };
  },

  async getComponentsByCategory(categoryId: string, limit = 20) {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .limit(limit)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getAllCategories() {
    const { data, error } = await supabase
      .from('component_categories')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },
};

// Component submission helpers
export const componentSubmissions = {
  async submitComponent(submission: Record<string, any>) {
    const { data, error } = await supabase
      .from('component_submissions')
      .insert([submission])
      .select()
      .single();
    return { data, error };
  },

  async getUserSubmissions(userId: string) {
    const { data, error } = await supabase
      .from('component_submissions')
      .select('*')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getPendingSubmissions() {
    const { data, error } = await supabase
      .from('component_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async updateSubmissionStatus(
    submissionId: string,
    status: string,
    reviewNotes?: string,
    reviewedBy?: string
  ) {
    const { data, error } = await supabase
      .from('component_submissions')
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_by: reviewedBy,
      })
      .eq('id', submissionId)
      .select()
      .single();
    return { data, error };
  },

  async approveAndCreateComponent(submissionId: string, userId: string) {
    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from('component_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    // Create the component
    const { data: component, error: createError } = await supabase
      .from('components')
      .insert([
        {
          name: submission.name,
          part_number: submission.part_number,
          category_id: submission.category_id,
          description: submission.description,
          working_principle: submission.working_principle,
          specifications: submission.specifications,
          pin_configuration: submission.pin_configuration,
          real_image_url: submission.real_image_url,
          circuit_symbol_url: submission.circuit_symbol_url,
          datasheet_url: submission.datasheet_url,
          manufacturer: submission.manufacturer,
          is_active: true,
          created_by: submission.submitted_by,
        },
      ])
      .select()
      .single();

    if (createError) return { data: null, error: createError };

    // Update submission status
    await supabase
      .from('component_submissions')
      .update({
        status: 'approved',
        reviewed_by: userId,
      })
      .eq('id', submissionId);

    return { data: component, error: null };
  },
};

// Project helpers
export const projects = {
  async createProject(userId: string, name: string, description?: string) {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name,
          description,
          is_public: false,
          is_template: false,
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  async getUserProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  async getProjectById(projectId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    return { data, error };
  },

  async updateProject(projectId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    return { data, error };
  },

  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    return { error };
  },
};

// Circuit instance helpers
export const circuitInstances = {
  async addInstance(projectId: string, componentId: string, x: number, y: number) {
    const { data, error } = await supabase
      .from('circuit_instances')
      .insert([
        {
          project_id: projectId,
          component_id: componentId,
          x_position: x,
          y_position: y,
          z_position: 0,
          rotation: 0,
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  async getProjectInstances(projectId: string) {
    const { data, error } = await supabase
      .from('circuit_instances')
      .select('*')
      .eq('project_id', projectId);
    return { data, error };
  },

  async updateInstance(instanceId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('circuit_instances')
      .update(updates)
      .eq('id', instanceId)
      .select()
      .single();
    return { data, error };
  },

  async deleteInstance(instanceId: string) {
    const { error } = await supabase
      .from('circuit_instances')
      .delete()
      .eq('id', instanceId);
    return { error };
  },
};

// Connection helpers
export const connections = {
  async addConnection(
    projectId: string,
    fromInstanceId: string,
    fromPin: string,
    toInstanceId: string,
    toPin: string
  ) {
    const { data, error } = await supabase
      .from('connections')
      .insert([
        {
          project_id: projectId,
          from_instance_id: fromInstanceId,
          from_pin: fromPin,
          to_instance_id: toInstanceId,
          to_pin: toPin,
          wire_color: '#00ff88',
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  async getProjectConnections(projectId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('project_id', projectId);
    return { data, error };
  },

  async deleteConnection(connectionId: string) {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);
    return { error };
  },

  async deleteInstanceConnections(instanceId: string) {
    const { error } = await supabase
      .from('connections')
      .delete()
      .or(`from_instance_id.eq.${instanceId},to_instance_id.eq.${instanceId}`);
    return { error };
  },
};
