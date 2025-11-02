import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";

export default function FilterTabs({ tabs, data, onChange }) {
  const [activeTab, setActiveTab] = useState(0);

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

  return (
    <Box
      sx={{
        display: "inline-flex",
        bgcolor: "#EAECF0",
        p: 0.7,
        borderRadius: "20px",
        overflow: "visible",
        borderRadius: "4px",
        pointerEvents: "auto",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        TabIndicatorProps={{ style: { display: "none" } }}
        variant="standard"
        sx={{
          minHeight: 32,
          "& .MuiTabs-flexContainer": {
            gap: 0,
          },
          "& .MuiTabs-indicator": { display: "none" },
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
              fontSize : "14px",
              textTransform: "none",
              width: 126,
              minHeight: "auto",
              padding: "6px 4px",
              borderRadius: "4px",
              bgcolor: "transparent",
              color: "#000000ff",
              fontWeight: 200,
              mx: 0.5,
              outline: "none",             
              "&:focus": { outline: "none" },
              "&.Mui-focusVisible": {      
                outline: "none",
              },
              "&.Mui-selected": {
                bgcolor: "#fff",
                color: "#000",
                fontWeight: 200,
                boxShadow: "0 1px 2px #B9B3C0",
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
