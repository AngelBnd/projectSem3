import { Grid, Paper, Typography } from "@mui/material";

function Dashboard() {
  return (
    <Grid container spacing={2} >
      {/* 4 boxes on top */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Total Sales</Typography>
          <Typography variant="h4">Rp 12,500,000</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Total Profit</Typography>
          <Typography variant="h4">Rp 3,500,000</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Total Profit</Typography>
          <Typography variant="h4">Rp 3,500,000</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">im ok</Typography>
          <Typography variant="h4">Rp 3,500,000</Typography>
        </Paper>
      </Grid> 
      <Grid item xs={12} sm={6} md={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">h</Typography>
          <Typography variant="h4">Rp 3,500,000</Typography>
        </Paper>
      </Grid>  
    </Grid>
  );
}

export default Dashboard;
