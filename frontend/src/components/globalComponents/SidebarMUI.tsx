// components/SidebarMUI.jsx
import React, { useState, useEffect } from "react";
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
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  DashboardIcon,
  SalesIcon,
  InventoryIcon,
  ChevronDownIcon,
  CardboardIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  PurchaseOrdersIcon,
} from "../../assets/SvgIcons";
import SidebarFooter from "./sidebarFooter";
import { useNavigate } from "react-router-dom";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { hasPermission, hasAnyRole } from "../../utils/auth";

export const drawerWidth = 240;

interface SidebarMUIProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const SidebarMUI = ({ mobileOpen, handleDrawerToggle }: SidebarMUIProps) => {
  const [user, setUser] = useState({ username: "", role: "" });
  const [openInventory, setOpenInventory] = useState(false);

  const handleInventoryClick = () => {
    setOpenInventory(!openInventory);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navList = (
    <div>
      <Box sx={{ px: 3, pt: 3.5, pb: 2 }}>
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
          pt: 2,
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
        <ListItem component={Link} to="/dashboard">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem component={Link} to="/products">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <CardboardIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>

        {/* Sales */}
        <ListItem component={Link} to="/sales">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <SalesIcon />
          </ListItemIcon>
          <ListItemText primary="Sales" />
        </ListItem>

        {/* Inventory */}
        <ListItem onClick={handleInventoryClick}>
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
            <ListItem
              sx={{ pl: 6 }}
              component={Link}
              to="/inventory/auditLogs"
            >
              <ListItemText primary="Audit Logs" />
            </ListItem>
            <ListItem
              sx={{ pl: 6 }}
              component={Link}
              to="/inventory/invMovement"
            >
              <ListItemText primary="Inv Movement" />
            </ListItem>
            <ListItem
              sx={{ pl: 6 }}
              component={Link}
              to="/inventory/suppliers"
            >
              <ListItemText primary="Suppliers" />
            </ListItem>
          </List>
        </Collapse>

        <ListItem component={Link} to="/purchaseOrders">
          <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
            <PurchaseOrdersIcon />
          </ListItemIcon>
          <ListItemText primary="Purchase Orders" />
        </ListItem>

        {hasPermission("user", "update") && (
          <ListItem component={Link} to="/users">
            <ListItemIcon sx={{ minWidth: 28, mr: 1.5 }}>
              <UsersIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
        )}
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
          height: "100vh",
        }}
      >
        {navList}
        <SidebarFooter />
      </Box>
    </>
  );
};

export default SidebarMUI;
