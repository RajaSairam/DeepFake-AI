import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  Mic,
  MessageSquare,
  Mail,
  Star,
  Briefcase,
  TrendingUp,
  FileText,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DetectionType } from "@/lib/types";
import { dbInsertScan, runMockAnalysis } from "@/lib/mockDb";

const contentTypes: {
  id: DetectionType;
  label: string;
  description: string;
  icon: React.ElementType;
  acceptsFile: boolean;
  acceptsText: boolean;
  fileTypes?: string;
}[] = [
    {
      id: "image",
      label: "Image",
      description: "Detect deepfake or manipulated images",
      icon: Image,
      acceptsFile: true,
      acceptsText: false,
      fileTypes: "image/*",
    },
    {
      id: "video",
      label: "Video",
      description: "Analyze videos for deepfake content",
      icon: Video,
      acceptsFile: true,
      acceptsText: false,
      fileTypes: "video/*",
    },
    {
      id: "audio",
      label: "Audio",
      description: "Detect voice cloning and audio manipulation",
      icon: Mic,
      acceptsFile: true,
      acceptsText: false,
      fileTypes: "audio/*",
    },
    {
      id: "text",
      label: "Text Message",
      description: "Analyze SMS or messaging scams",
      icon: MessageSquare,
      acceptsFile: false,
      acceptsText: true,
    },
    {
      id: "email",
      label: "Email",
      description: "Detect phishing and spoofed emails",
      icon: Mail,
      acceptsFile: false,
      acceptsText: true,
    },
    {
      id: "review",
      label: "Review",
      description: "Identify fake reviews and ratings",
      icon: Star,
      acceptsFile: false,
      acceptsText: true,
    },
    {
      id: "investment",
      label: "Investment",
      description: "Detect investment and financial scams",
      icon: TrendingUp,
      acceptsFile: false,
      acceptsText: true,
    },
    {
      id: "job_offer",
      label: "Job Offer",
      description: "Identify fraudulent job postings",
      icon: Briefcase,
      acceptsFile: false,
      acceptsText: true,
    },
  ];

export default function NewScan() {
  const [selectedType, setSelectedType] = useState<DetectionType | null>(null);
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const selectedConfig = contentTypes.find((t) => t.id === selectedType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !user) return;

    const config = contentTypes.find((t) => t.id === selectedType);
    if (!config) return;

    if (config.acceptsText && !textContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter the content you want to analyze",
        variant: "destructive",
      });
      return;
    }

    if (config.acceptsFile && !config.acceptsText && !file) {
      toast({
        title: "File required",
        description: "Please upload a file to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create scan record locally
      const scan = dbInsertScan(
        user.id,
        selectedType,
        null,                        // no actual file upload in mock mode
        file?.name ?? null,
        file?.size ?? null,
        textContent || null
      );

      toast({
        title: "Analyzing...",
        description: "Our AI is examining your content. This takes a few seconds.",
      });

      // Run mock AI analysis (async, stores result back to localStorage)
      await runMockAnalysis(scan.id, selectedType, textContent || null, file?.name ?? null);

      toast({
        title: "Scan complete",
        description: "Your content has been analyzed successfully",
      });

      navigate(`/dashboard/scan/${scan.id}`);
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2">New Scan</h1>
          <p className="text-muted-foreground">
            Select the type of content you want to analyze for potential fraud or manipulation.
          </p>
        </div>

        {/* Content type selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contentTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedType(type.id);
                setTextContent("");
                setFile(null);
              }}
              className={`relative p-4 rounded-xl text-left transition-all duration-200 ${selectedType === type.id
                ? "glass border-primary ring-2 ring-primary/50"
                : "glass hover:border-primary/30"
                }`}
            >
              <type.icon
                className={`w-8 h-8 mb-3 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"
                  }`}
              />
              <h3 className="font-semibold mb-1">{type.label}</h3>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Input section */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold mb-4">
              {selectedConfig?.acceptsFile ? "Upload Content" : "Enter Content"}
            </h2>

            {selectedConfig?.acceptsFile && (
              <div className="mb-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-1">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
                      <input
                        type="file"
                        className="hidden"
                        accept={selectedConfig.fileTypes}
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {selectedConfig?.acceptsText && (
              <div className="mb-6">
                <Textarea
                  placeholder={`Paste the ${selectedConfig.label.toLowerCase()} content here...`}
                  className="min-h-[200px] bg-secondary border-border resize-none"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {textContent.length} characters
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedType(null);
                  setTextContent("");
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}