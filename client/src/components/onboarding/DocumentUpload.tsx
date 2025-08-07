import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

interface DocumentUploadProps {
  onUpload: (panFile: File, aadhaarFile: File) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function DocumentUpload({ onUpload, onBack, isLoading }: DocumentUploadProps) {
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (panFile && aadhaarFile) {
      onUpload(panFile, aadhaarFile);
    }
  };

  const canSubmit = panFile && aadhaarFile && !isLoading;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-file-upload text-primary mr-3" />
          Upload Identity Documents
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Upload clear images or PDFs of your PAN and Aadhaar cards. Our system will automatically extract and verify all information.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileUpload
            label="PAN Card Document"
            placeholder="Drag and drop your PAN card here"
            onFileSelect={setPanFile}
            file={panFile}
            onRemove={() => setPanFile(null)}
            uploading={isLoading && !!panFile}
          />

          <FileUpload
            label="Aadhaar Card Document"
            placeholder="Drag and drop your Aadhaar card here"
            onFileSelect={setAadhaarFile}
            file={aadhaarFile}
            onRemove={() => setAadhaarFile(null)}
            uploading={isLoading && !!aadhaarFile}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-8 py-3 font-medium text-lg"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-3" />
                Uploading & Processing...
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-3" />
                Start OCR Verification
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
