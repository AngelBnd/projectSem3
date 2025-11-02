import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const BreadcrumbsMUI = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 4, fontFamily: "Lato, sans-serif" }} 
    >
      <RouterLink
        to="/"
        style={{ textDecoration: "none", color: "#6B7280" }}
      >
        Home
      </RouterLink>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography
            key={routeTo}
            color="text.primary"
            sx={{ fontFamily: "Lato, sans-serif", textTransform: "capitalize" }}
          >
            {name.replace("-", " ")}
          </Typography>
        ) : (
          <RouterLink
            key={routeTo}
            to={routeTo}
            style={{ textDecoration: "none", color: "#6B7280" }}
          >
            <Typography sx={{ fontFamily: "Lato, sans-serif", textTransform: "capitalize" }}>
              {name.replace("-", " ")}
            </Typography>
          </RouterLink>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsMUI;
