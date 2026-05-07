import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pdf') || selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload the document
      const result = await apiService.uploadDocument(file);
      
      clearInterval(interval);
      setProgress(100);

      toast({
        title: "Upload Successful",
        description: result.message,
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleExplain = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to explain.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Explain the document
      const explanation = await apiService.explainDocument(file);
      
      clearInterval(interval);
      setProgress(100);

      // Show explanation in an alert or modal (you can customize this)
      alert(`Document Explanation:\n\n${explanation}`);

      toast({
        title: "Explanation Ready",
        description: "Document explained successfully!",
      });
    } catch (error) {
      console.error("Explain error:", error);
      toast({
        title: "Explanation Failed",
        description: error instanceof Error ? error.message : "An error occurred while explaining the document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Processing</CardTitle>
        <CardDescription>Upload legal documents to enhance the AI's knowledge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="document-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            <label htmlFor="document-upload">
              <Button variant="outline" asChild>
                <span>{file ? file.name : "Choose Document"}</span>
              </Button>
            </label>
          </div>

          {file && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload & Process"}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleExplain} 
                  disabled={isUploading}
                >
                  {isUploading ? "Processing..." : "Explain Document"}
                </Button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Processing...</div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}