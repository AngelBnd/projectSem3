import { useState } from "react";
import type { MouseEvent } from "react";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { SalesOrderSummary } from "../../../types";
import { usePopup } from "../../../components/globalComponents/PopupContext";
import { PopupError } from "../../../components/globalComponents/PopupComp";
import { EditIcon, TrashIcon, ThreeDotsIcon } from "../../../assets/SvgIcons";
import type { OrderId } from "../api";

interface SalesOrderActionsCellProps {
  params: GridRenderCellParams<SalesOrderSummary>;
  onDelete: (salesOrderId: OrderId) => void;
}

export default function SalesOrderActionsCell({
  params,
  onDelete,
}: SalesOrderActionsCellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { openPopup, closePopup } = usePopup();

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleClose();

    const isPaid = params.row.paymentStatus === "PAID";
    const isDelivered = params.row.deliveryStatus === "DELIVERED";

    if (isPaid && isDelivered) {
      openPopup(
        <PopupError message="You cannot edit orders that are already Paid and Delivered." />,
      );

      setTimeout(() => {
        closePopup();
      }, 2000);
    } else {
      navigate(`/sales/edit/${params.row.id}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        height: "100%",
      }}
    >
      <Tooltip title="More actions">
        <IconButton
          onClick={handleOpen}
          sx={{
            backgroundColor: "rgba(51, 118, 252, 0.1)",
            color: "#3376FC",
            "&:hover": {
              backgroundColor: "rgba(51, 118, 252, 0.18)",
            },
            width: 28,
            height: 28,
          }}
        >
          <ThreeDotsIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            },
          },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <div className="flex gap-3">
            <EditIcon className="text-blue-500" />
            Edit
          </div>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onDelete(params.row.id);
          }}
          sx={{ color: "error.main" }}
        >
          <div className="flex gap-3 items-center">
            <TrashIcon className="text-red-500" />
            Delete
          </div>
        </MenuItem>
      </Menu>
    </Box>
  );
}
