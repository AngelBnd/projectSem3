// components/SidebarMUI.jsx
import React, { useState } from "react";
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  ListItemIcon,
  Collapse,
  IconButton,
  Typography,
  Button
} from "@mui/material";
import { Link } from "react-router-dom";
import { DashboardIcon, SalesIcon, InventoryIcon, ChevronDownIcon, CardboardIcon, UsersIcon, SettingsIcon } from "./SvgIcons";

import { ExpandLess, ExpandMore } from "@mui/icons-material";

export const drawerWidth = 240;


const SidebarFooter = () => (
  <div className="px-7 pb-8 pt-[20px] mt-auto flex items-center justify-between border-t border-gray-200">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full overflow-hidden inline-block mr-2">
        <img
          src="/path/to/profile.jpg"
          alt="User"
          className="w-full h-full object-cover bg-gray-500"
        />
      </div>
      <div>
        <div className="text-black text-sm font-nunito">Usernamenya</div>
        <div className="text-gray-500 text-xs">Rolenya</div>
      </div>
    </div>

    <div
      className="cursor-pointer p-1"
      onClick={() => console.log('Open settings')}
    >
      <SettingsIcon/>
    </div>
  </div>
);

const SidebarMUI = ({ mobileOpen, handleDrawerToggle }) => {
  const [openInventory, setOpenInventory] = useState(false);

  const handleInventoryClick = () => {
    setOpenInventory(!openInventory);
  };

  const navList = (
    <div>
      <Box sx={{ px: 3, pt: 3.5, pb: 2}}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: "bold",
            color: "#111",

          }}
        >
          StockWise
        </Typography>
      </Box>
      <Divider />
        <List
          sx={{
            px: 3,
            pt : 2,
            fontFamily: "Nunito, sans-serif",
            "& .MuiListItem-root": {
              borderRadius: "10px",
              mb: 1,
              px: 1,
              "&:hover": {
                backgroundColor: "rgba(168, 179, 202, 0.15)", 
              },
            },
            "& .MuiListItemText-primary": {
              fontFamily: "Nunito, sans-serif",
              color: "#000",
              fontSize: "16px",
            },
            "& .Mui-selected": {
              backgroundColor: "rgba(168, 179, 202, 0.15) !important", 
              "&:hover": {
                backgroundColor: "rgba(168, 179, 202, 0.15)", 
              },
            },
          }}
        >
        {/* Dashboard */}
        <ListItem button component={Link} to="/dashboard" >
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component={Link} to="/products">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <CardboardIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>

        {/* Sales */}
        <ListItem button component={Link} to="/sales">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <SalesIcon />
          </ListItemIcon>
          <ListItemText primary="Sales" />
        </ListItem>

        {/* Inventory */}
        <ListItem button onClick={handleInventoryClick}>
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Inventory" />
          <Box sx={{ ml: 0.5, display: "flex", alignItems: "center" }}>
            <ChevronDownIcon />
          </Box>
        </ListItem>

        <Collapse in={openInventory} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ pl: 6 }} component={Link} to="/inventory/items">
              <ListItemText primary="Audit Logs" />
            </ListItem>
            <ListItem button sx={{ pl: 6 }} component={Link} to="/inventory/categories">
              <ListItemText primary="Inv Movement" />
            </ListItem>
            <ListItem button sx={{ pl: 6 }} component={Link} to="/inventory/categories">
              <ListItemText primary="Suppliers" />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button component={Link} to="/users">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <UsersIcon />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
      </List>
    </div>
  );


  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {navList}
        <SidebarFooter />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",    
          width: drawerWidth,
          flexShrink: 0,
          borderRight: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "#fff",
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        {navList}
        <SidebarFooter />
      </Box>
    </>
  );
};

export default SidebarMUI;
 