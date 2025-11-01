// components/SidebarMUI.jsx
import React from 'react';
import { Drawer, Toolbar, Divider, List, ListItem, ListItemText, Box } from '@mui/material';
import { Link } from 'react-router-dom';

export const drawerWidth = 240;

const SidebarMUI = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navList = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/inventory">
          <ListItemText primary="Inventory" />
        </ListItem>
        <ListItem button component={Link} to="/sales">
          <ListItemText primary="Sales" />
        </ListItem>
        <ListItem button component={Link} to="/PendingList">
          <ListItemText primary="Pending List" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {navList}
      </Drawer>

      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          // optional visual:
          borderRight: '1px solid rgba(0,0,0,0.08)',
          backgroundColor: '#fff',
        }}
        aria-hidden={isMobile}
      >
        {navList}
      </Box>
    </>
  );
};

export default SidebarMUI;
