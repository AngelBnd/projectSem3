import { useState, MouseEvent } from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { EditIcon, TrashIcon } from "../../../assets/SvgIcons";

// Round light-blue button used for both actions
const circleButtonSx = {
  width: 32,
  height: 32,
  color: "#3B82F6",
  backgroundColor: "#EFF4FF",
  "&:hover": { backgroundColor: "#DBE7FF" },
};

type RowActionsProps = {
  row: any;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
};

export function RowActions({ row, onView, onEdit, onDelete }: RowActionsProps) {
  // Each row gets its own menu state because this is its own component
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const openMenu = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const closeMenu = () => setAnchorEl(null);

  return (
    <div className="flex items-center gap-2 h-full">
      <IconButton
        size="small"
        sx={circleButtonSx}
        aria-label="View"
        onClick={(e) => {
          e.stopPropagation();
          onView?.(row);
        }}
      >
        <SearchIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <IconButton
        size="small"
        sx={circleButtonSx}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={openMenu}
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            onEdit?.(row);
          }}
        >
          <div className="flex gap-3">
            <EditIcon className="text-blue-500" />
            Edit
          </div>
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            onDelete?.(row);
          }}
          sx={{ color: "error.main" }}
        >
          <div className="flex gap-3 items-center">
            <TrashIcon className="text-red-500" />
            Delete
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
