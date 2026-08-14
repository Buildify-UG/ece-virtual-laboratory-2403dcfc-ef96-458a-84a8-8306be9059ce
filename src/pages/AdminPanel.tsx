import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ComponentSubmission {
  id: string;
  name: string;
  part_number?: string;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  created_at: string;
  description?: string;
}

export default function AdminPanel() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<ComponentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ComponentSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('component_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const { data: submission } = await supabase
        .from('component_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (!submission) {
        toast.error('Submission not found');
        return;
      }

      const { data: categoryData } = await supabase
        .from('component_categories')
        .select('id')
        .eq('name', submission.category_id)
        .single();

      const { error: createError } = await supabase
        .from('components')
        .insert({
          name: submission.name,
          part_number: submission.part_number,
          category_id: categoryData?.id || submission.category_id,
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
        });

      if (createError) throw createError;

      await supabase
        .from('component_submissions')
        .update({
          status: 'approved',
          reviewed_by: profile?.id,
          review_notes: reviewNotes,
        })
        .eq('id', submissionId);

      toast.success('Component approved and added to library');
      setReviewNotes('');
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve component');
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      await supabase
        .from('component_submissions')
        .update({
          status: 'rejected',
          reviewed_by: profile?.id,
          review_notes: reviewNotes,
        })
        .eq('id', submissionId);

      toast.success('Component submission rejected');
      setReviewNotes('');
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject component');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'revision_requested':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(var(--lab-dark))] to-[hsl(var(--lab-darker))] text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-8 h-8 text-[hsl(var(--lab-cyan))]" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--lab-cyan))] to-[hsl(var(--lab-purple))] bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(var(--lab-light))]">
            <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedSubmissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
            ) : pendingSubmissions.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No pending submissions</Card>
            ) : (
              pendingSubmissions.map(submission => (
                <Card
                  key={submission.id}
                  className="p-6 border-[hsl(var(--lab-cyan))]/30 cursor-pointer hover:border-[hsl(var(--lab-cyan))]/60"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{submission.name}</h3>
                      <p className="text-sm text-muted-foreground">{submission.part_number}</p>
                    </div>
                    <Badge>Pending</Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedSubmissions.map(submission => (
              <Card key={submission.id} className="p-6 border-green-500/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">{submission.name}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedSubmissions.map(submission => (
              <Card key={submission.id} className="p-6 border-red-500/30">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-semibold">{submission.name}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">{selectedSubmission.name}</h2>
                <Textarea
                  placeholder="Review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
                {selectedSubmission.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      className="flex-1 bg-green-600"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedSubmission.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setSelectedSubmission(null)} className="w-full">
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}