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

import { ExpandLess, ExpandMore } from "@mui/icons-material";

export const drawerWidth = 240;

// ===== ICONS =====
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_1115_941)">
      <path
        d="M5 4H9C9.27 4 9.52 4.1 9.71 4.29C9.89 4.48 10 4.73 10 5V11C10 11.27 9.89 11.52 9.71 11.71C9.52 11.89 9.27 12 9 12H5C4.73 12 4.48 11.89 4.29 11.71C4.1 11.52 4 11.27 4 11V5C4 4.73 4.1 4.48 4.29 4.29C4.48 4.1 4.73 4 5 4Z"
        stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M5 16H9C9.27 16 9.52 16.1 9.71 16.29C9.89 16.48 10 16.73 10 17V19C10 19.27 9.89 19.52 9.71 19.71C9.52 19.89 9.27 20 9 20H5C4.73 20 4.48 19.89 4.29 19.71C4.1 19.52 4 19.27 4 19V17C4 16.73 4.1 16.48 4.29 16.29C4.48 16.1 4.73 16 5 16Z"
        stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M15 12H19C19.27 12 19.52 12.1 19.71 12.29C19.89 12.48 20 12.73 20 13V19C20 19.27 19.89 19.52 19.71 19.71C19.52 19.89 19.27 20 19 20H15C14.73 20 14.48 19.89 14.29 19.71C14.1 19.52 14 19.27 14 19V13C14 12.73 14.1 12.48 14.29 12.29C14.48 12.1 14.73 12 15 12Z"
        stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M15 4H19C19.27 4 19.52 4.1 19.71 4.29C19.89 4.48 20 4.73 20 5V7C20 7.27 19.89 7.52 19.71 7.71C19.52 7.89 19.27 8 19 8H15C14.73 8 14.48 7.89 14.29 7.71C14.1 7.52 14 7.27 14 7V5C14 4.73 14.1 4.48 14.29 4.29C14.48 4.1 14.73 4 15 4Z"
        stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  </svg>
);

const SalesIcon = () => (
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
    <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
    <path d="M12 17v1m0 -8v1" />
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_1115_984)">
      <path
        d="M3 21V8L12 4L21 8V21M13 13H17V21H7V15H13M13 21V12C13 11.73 12.89 11.48 12.71 11.29C12.52 11.1 12.27 11 12 11H10C9.73 11 9.48 11.1 9.29 11.29C9.1 11.48 9 11.73 9 12V15"
        stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 9l6 6l6 -6" />
  </svg>
);

const CardboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-dropbox"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7.5 10.625l-4.5 -2.813l4.5 -2.812l4.5 2.813m-4.5 2.812l4.5 -2.813m-4.5 2.813l-4.5 2.823l4.5 2.802m0 -5.625l4.5 2.823m0 -5.636l4.5 2.791l4.5 -2.812l-4.5 -2.791l-4.5 2.813zm-4.5 8.438l4.5 -2.802m-4.5 2.802v1.123l4.5 2.627l4.5 -2.627v-1.123m-4.5 -2.802l4.5 -2.823l4.5 2.823l-4.5 2.802m-4.5 -2.802l4.5 2.802" /></svg>
);


const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-users-group"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" /><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M17 10h2a2 2 0 0 1 2 2v1" /><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M3 13v-1a2 2 0 0 1 2 -2h2" /></svg>
);

const SettingsIcon = ()=>(
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
)

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
 