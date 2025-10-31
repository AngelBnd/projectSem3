// components/SidebarMUI.jsx
import React from "react";
import { Drawer, List, ListItem, ListItemText, Toolbar, Divider } from "@mui/material";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const SidebarMUI = () => {
  const menuItems = [
    { text: "Dashboard", path: "/dashboard" },
    { text: "Inventory", path: "/inventory" },
    { text: "Sales", path: "/sales" },
    { text: "Pending List", path: "/PendingList" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SidebarMUI;
