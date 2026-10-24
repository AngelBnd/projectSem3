import { useState, useEffect, useRef } from "react";
import type { SyntheticEvent } from "react";
import { Tabs, Tab, Box, useTheme, useMediaQuery } from "@mui/material";

export interface FilterTab<T = any> {
  label: string;
  filterFn?: (rows: T[]) => T[];
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab?: number;
  onChange?: (index: number) => void;
}

export default function FilterTabs({ tabs, activeTab: propActiveTab, onChange }: FilterTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{
    width?: number;
    height?: number;
    transform?: string;
  }>({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onChange) {
      onChange(newValue); 
    }
    (event.currentTarget as HTMLElement).blur();
  };

  const updatePill = () => {
    const tabNodes = tabsRef.current?.querySelectorAll<HTMLElement>(".MuiTab-root");
    if (tabNodes && tabNodes[activeTab]) {
      const node = tabNodes[activeTab];
      setPillStyle({
        width: node.offsetWidth,
        transform: `translateX(${node.offsetLeft}px)`,
        height: node.offsetHeight,
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      updatePill();
    };

    updatePill();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, tabs, isSmallScreen]);

  useEffect(() => {
    if (propActiveTab !== undefined && propActiveTab !== activeTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  
  return (
    <Box
      sx={{
        display: "inline-flex",
        bgcolor: "#EAECF0",
        p: 0.5,
        borderRadius: "4px",
         
        overflowX: "auto", 
      }}
    >
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bgcolor: "#fff",
            borderRadius: "4px",
            boxShadow: "0 1px 2px #B9B3C0",
            transition: "transform 0.3s ease, width 0.3s ease",
            transform: pillStyle.transform || "translateX(0px)",
            width: pillStyle.width ,
            height: pillStyle.height || "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Tabs
          ref={tabsRef}
          value={activeTab}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { display: "none" } }}
          variant="standard"
          sx={{
            minHeight: 32,
            "& .MuiTabs-flexContainer": { gap: 0 },
            position: "relative", 
            zIndex: 1,
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              disableFocusRipple
              disableRipple
              sx={{
                fontFamily: "Lato, sans-serif",
                fontSize: "14px",
                textTransform: "none",
                minWidth: isSmallScreen ? 80 : 126,
                minHeight: "auto",
                padding: "6px 4px",
                borderRadius: "4px",
                color: "#000",
                fontWeight: 200,
                mx: 0.5,
                position: "relative",
                zIndex: 1,
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
