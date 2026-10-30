import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const BreadcrumbsMUI = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map fixed paths to friendly names
  const pathNameMap: Record<string, string> = {
    sales: "Sales",
    products: "Product",
    edit: "Edit Sales Order",
    "create-order-sales": "Create Sales Order",
  };

  return (
    <Breadcrumbs
      className="no-print"
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 0, fontFamily: "Lato, sans-serif" }}
    >
      <RouterLink to="/" style={{ textDecoration: "none", color: "#6B7280" }}>
        Home
      </RouterLink>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        let displayName = "";
        if (!isNaN(Number(name)) && index > 0) {
          const prevName = pathnames[index - 1];
          if (pathNameMap[prevName]) {
            displayName = `${pathNameMap[prevName]} ${name}`;
          } else {
            displayName = name;
          }
        } else {
          displayName =
            pathNameMap[name] ||
            name
              .replace("-", " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
        }

        if (
          index < pathnames.length - 1 &&
          !isNaN(Number(pathnames[index + 1]))
        ) {
          return null;
        }

        return isLast || isNaN(Number(name)) ? (
          isLast ? (
            <Typography
              key={routeTo}
              color="text.primary"
              sx={{ fontFamily: "Lato, sans-serif", textTransform: "none" }}
            >
              {displayName}
            </Typography>
          ) : (
            <RouterLink
              key={routeTo}
              to={routeTo}
              style={{ textDecoration: "none", color: "#6B7280" }}
            >
              <Typography
                sx={{ fontFamily: "Lato, sans-serif", textTransform: "none" }}
              >
                {displayName}
              </Typography>
            </RouterLink>
          )
        ) : null;
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsMUI;
