import React, { useState, useEffect, useRef } from "react";
import { Tabs, Tab, Box } from "@mui/material";

export default function FilterTabs({ tabs, data, onChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    event.currentTarget.blur();
  };

  useEffect(() => {
    if (onChange) {
      const filteredData = tabs[activeTab].filterFn(data);
      onChange(filteredData, activeTab);
    }
  }, [activeTab, data, tabs, onChange]);

  useEffect(() => {
    const tabNodes = tabsRef.current?.querySelectorAll(".MuiTab-root");
    if (tabNodes && tabNodes[activeTab]) {
      const node = tabNodes[activeTab];
      setPillStyle({
        width: node.offsetWidth,
        transform: `translateX(${node.offsetLeft}px)`,
        height: node.offsetHeight,
      });
    }
  }, [activeTab, tabsRef.current]);

  return (
    <Box
      sx={{
        display: "inline-flex",
        bgcolor: "#EAECF0",
        p: 0.7,
        borderRadius: "4px",
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
            width: pillStyle.width || 126,
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
            position: "relative", // pill is relative to this
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
                width: 126,
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
