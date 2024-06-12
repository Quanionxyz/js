import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "../../lib/utils";
import { ScrollShadow } from "./ScrollShadow/ScrollShadow";
import { Button } from "./button";
import Link from "next/link";

export function TabLinks(props: {
  links: { name: string; href: string; isActive: boolean }[];
}) {
  const { containerRef, lineRef, activeTabRef } =
    useUnderline<HTMLAnchorElement>();

  return (
    <div className="relative">
      <ScrollShadow scrollableClassName="pb-[8px] relative">
        <div className="flex" ref={containerRef}>
          {props.links.map((tab) => {
            return (
              <Button asChild key={tab.name} variant="ghost">
                <Link
                  data-active={tab.isActive}
                  ref={tab.isActive ? activeTabRef : undefined}
                  href={tab.href}
                  className={cn(
                    "rounded-lg hover:bg-muted px-3 font-medium text-sm lg:text-base relative h-auto",
                    !tab.isActive && "opacity-50 hover:opacity-100",
                  )}
                >
                  {tab.name}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Active line */}
        <div
          ref={lineRef}
          className="absolute left-0 bottom-0 z-10 h-[2px] bg-foreground rounded-lg fade-in-0 animate-in"
        ></div>
      </ScrollShadow>
      {/* Bottom line */}
      <div className="h-[1px] bg-border -translate-y-[2px]"></div>
    </div>
  );
}

export function TabButtons(props: {
  tabs: {
    name: string;
    onClick: () => void;
    isActive: boolean;
    isEnabled?: boolean;
    icon?: React.FC<{ className?: string }>;
  }[];
  tabClassName?: string;
}) {
  const { containerRef, lineRef, activeTabRef } =
    useUnderline<HTMLButtonElement>();

  return (
    <div className="relative">
      <ScrollShadow scrollableClassName="pb-[8px] relative">
        <div className="flex" ref={containerRef}>
          {props.tabs.map((tab) => {
            return (
              <Button
                key={tab.name}
                variant="ghost"
                ref={tab.isActive ? activeTabRef : undefined}
                className={cn(
                  "rounded-lg hover:bg-accent px-2 lg:px-3 font-medium text-sm lg:text-base relative h-auto inline-flex gap-1.5 items-center",
                  !tab.isActive &&
                    "text-muted-foreground hover:text-foreground",
                  !tab.isEnabled && "cursor-not-allowed opacity-50",
                  props.tabClassName,
                )}
                onClick={tab.isEnabled ? tab.onClick : undefined}
              >
                {tab.icon && <tab.icon className="size-6" />}
                {tab.name}
              </Button>
            );
          })}
        </div>

        {/* Active line */}
        <div
          ref={lineRef}
          className="absolute left-0 bottom-0 z-10 h-[2px] bg-foreground rounded-lg fade-in-0 animate-in"
        ></div>
      </ScrollShadow>
      {/* Bottom line */}
      <div className="h-[1px] bg-border -translate-y-[2px]"></div>
    </div>
  );
}

function useUnderline<El extends HTMLElement>() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeTabEl, setActiveTabEl] = useState<El | null>(null);

  const activeTabRef = useCallback((el: El | null) => {
    setActiveTabEl(el);
  }, []);

  useEffect(() => {
    if (activeTabEl && containerRef.current && lineRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const lineEl = lineRef.current;
      const rect = activeTabEl.getBoundingClientRect();
      lineEl.style.width = `${rect.width}px`;
      lineEl.style.transform = `translateX(${rect.left - containerRect.left}px)`;
      setTimeout(() => {
        lineEl.style.transition = "transform 0.3s, width 0.3s";
      }, 0);

      activeTabEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTabEl]);

  return { containerRef, lineRef, activeTabRef };
}
