import { cn } from "@/lib/utils";

type Status = "pending" | "processing" | "completed" | "failed";

interface StatusIndicatorProps {
  status: Status;
  label: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <i className="fas fa-clock text-muted-foreground" />;
      case "processing":
        return <i className="fas fa-spinner fa-spin text-warning" />;
      case "completed":
        return <i className="fas fa-check-circle text-success" />;
      case "failed":
        return <i className="fas fa-times-circle text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case "pending":
        return "text-muted-foreground";
      case "processing":
        return "text-warning";
      case "completed":
        return "text-success";
      case "failed":
        return "text-destructive";
    }
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-sm">{label}</span>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={cn("text-sm", getStatusTextColor())}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
