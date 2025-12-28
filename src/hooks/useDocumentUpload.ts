import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadDocument = useCallback(async (
    file: File,
    metadata: {
      documentType: string;
      propertyId?: string;
      dealId?: string;
      investorId?: string;
      visibility?: string;
    }
  ) => {
    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${metadata.documentType}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setProgress(50);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          document_name: file.name,
          document_type: metadata.documentType,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          property_id: metadata.propertyId || null,
          deal_id: metadata.dealId || null,
          investor_id: metadata.investorId || null,
          visibility: metadata.visibility || 'Private',
          uploaded_by: user?.id
        })
        .select()
        .single();

      if (docError) throw docError;

      setProgress(100);
      toast.success('Document uploaded successfully');
      return docData;

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('documents').remove([filePath]);

      // Delete record
      await supabase.from('documents').delete().eq('id', documentId);

      toast.success('Document deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  }, []);

  return { uploadDocument, deleteDocument, uploading, progress };
}
