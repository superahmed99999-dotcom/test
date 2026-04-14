import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ThumbsUp } from "lucide-react";
import StatusBadge from "./StatusBadge";
import CategoryBadge from "./CategoryBadge";
import { Link } from "wouter";
import type { Issue } from "@shared/types";

interface IssueCardProps {
  issue: Issue;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function IssueCard({ issue, isSelected, onClick }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.id}`}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md border-none ${
          isSelected ? "ring-2 ring-primary bg-primary/5" : "bg-slate-50"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
            <StatusBadge status={issue.status} />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{issue.address}</span>
          </div>
          <div className="flex justify-between items-center">
            <CategoryBadge category={issue.category} />
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <ThumbsUp className="h-3 w-3" />
              <span>{issue.upvotes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
