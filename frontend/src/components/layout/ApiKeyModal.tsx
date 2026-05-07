import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function ApiKeyModal() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load current API key when modal opens
    const currentKey = apiService.getApiKey();
    if (currentKey) {
      setApiKey(currentKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      apiService.setApiKey(apiKey.trim());
      toast({
        title: "Success",
        description: "API key saved successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
    }
  };

  const handleClearApiKey = () => {
    apiService.clearApiKey();
    // Reset to default key
    const defaultKey = apiService.getApiKey();
    setApiKey(defaultKey || "");
    toast({
      title: "Success",
      description: "API key reset to default!",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage API Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Key Management</DialogTitle>
          <DialogDescription>
            Default API key is already configured. You can update it if needed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your API key"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClearApiKey}>
              Reset to Default
            </Button>
            <Button type="button" onClick={handleSaveApiKey}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}