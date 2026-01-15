import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  enrolledCount: number;
  maxCapacity: number;
  applicationFee: string;
  status: "open" | "closed" | "coming-soon";
  image?: string;
}

export function ProgramCard({
  id,
  title,
  description,
  duration,
  enrolledCount,
  maxCapacity,
  applicationFee,
  status,
  image,
}: ProgramCardProps) {
  const availableSpots = maxCapacity - enrolledCount;
  const isAlmostFull = availableSpots <= 5 && availableSpots > 0;

  return (
    <Card className="overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/80 to-primary overflow-hidden">
        {image && (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge 
            variant={status === "open" ? "approved" : status === "closed" ? "rejected" : "pending"}
          >
            {status === "open" ? "Enrolling Now" : status === "closed" ? "Closed" : "Coming Soon"}
          </Badge>
        </div>
        {isAlmostFull && (
          <div className="absolute top-4 right-4">
            <Badge variant="pending">
              Only {availableSpots} spots left!
            </Badge>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {enrolledCount}/{maxCapacity}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Application Fee</p>
            <p className="text-lg font-bold text-foreground">{applicationFee}</p>
          </div>
          <Link to={`/programs/${id}`}>
            <Button variant={status === "open" ? "default" : "outline"} disabled={status === "closed"}>
              {status === "open" ? "Apply Now" : "View Details"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
