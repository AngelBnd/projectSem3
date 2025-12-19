// components/DataTable.jsx
import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const CardDataGrid = styled(DataGrid)(({ theme }) => ({
  backgroundColor: "transparent",
  border: "none",

  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#F3F4F7",
    borderBottom: "none",
    borderRadius: "4px 4px 0 0",
    fontFamily: "Nunito, sans-serif",
  },

  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "#F3F4F7",
    paddingLeft: theme.spacing(2),
    fontWeight: "normal",
    color: "#000",
    fontSize: "14px",
  },

  "& .MuiDataGrid-row": {
    margin: theme.spacing(0.3, 0),
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
    border: "none",
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.2s",

    "&:hover": {
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.12)",
      transform: "translateY(-1px)",
    },

    "& .MuiDataGrid-cell": {
      borderBottom: "none !important",
      padding: theme.spacing(1.5, 2),
      display: "flex",
      alignItems: "center",
      fontFamily: "Lato, sans-serif",
    },
  },

  "& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox": {
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },

  "& .MuiCheckbox-root": {
    padding: 0,
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  "& .MuiDataGrid-virtualScroller, .MuiDataGrid-virtualScrollerContent": {
    backgroundColor: "transparent",
  },

  "& .MuiDataGrid-footerContainer": {
    backgroundColor: "transparent",
    borderTop: "none",
  },
}));

export default function DataTable({
  title,
  rows,
  columns,
  loading = false,
  CustomToolbar = null,
  gridProps = {},
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 500,
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            flexGrow: 1,
            border: "none",
            height: "100% !important",
            "& .MuiDataGrid-virtualScroller": {
              overflowY: "auto",
            },
          }}
          pagination
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              sx: {
                "& .MuiDataGrid-menu .MuiInputBase-input": {
                  color: "#000 !important",
                },

                "& .MuiDataGrid-menu .MuiMenuItem-root": {
                  color: "#000 !important",
                  "& .MuiTypography-root": {
                    color: "#000 !important",
                  },
                },

                "& .MuiDataGrid-menu .MuiCheckbox-root": {
                  color: "#000 !important",
                },
                "& .MuiDataGrid-menu .MuiSvgIcon-root": {
                  color: "#000 !important",
                },

                "& .MuiDataGrid-menu .MuiButton-root": {
                  color: "#000 !important",
                },
              },
            },
          }}
          {...gridProps}
        />
      </Box>
    </Box>
  );
}
