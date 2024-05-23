"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../../../@/lib/utils";
import { Button } from "../../../../../@/components/ui/button";

export function StarButton(props: {
  chainName: string;
  initialPreferred: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const { chainName, initialPreferred } = props;
  const [isPreferred, setIsPreferred] = useState(initialPreferred);

  return (
    <Button
      className={cn("!m-0 h-auto w-auto", props.className)}
      variant="ghost"
      size="icon"
      aria-label={
        isPreferred
          ? `Remove ${chainName} from preferred chains.`
          : `Add ${chainName} to preferred chains.`
      }
      onClick={() => setIsPreferred((prev) => !prev)}
    >
      <Star
        className={cn(
          "text-muted-foreground transition-all size-5",
          props.iconClassName,
        )}
        fill={isPreferred ? "rgba(218, 142, 71, 1)" : "transparent"}
        strokeWidth={1}
        stroke={isPreferred ? "rgba(218, 142, 71, 1)" : "currentColor"}
      />
    </Button>
  );
}
