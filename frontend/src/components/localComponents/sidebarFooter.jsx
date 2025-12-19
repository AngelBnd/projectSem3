import { useNavigate } from "react-router-dom";
import { LogOutIcon } from "../../assets/SvgIcons";

const SidebarFooter = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="px-7 pb-8 pt-[20px] mt-auto flex items-center justify-between border-t border-gray-200 text-black">
      <div className="flex items-center cursor-pointer" onClick={handleLogout}>
        Log out
      </div>

      <div className="cursor-pointer" onClick={handleLogout}>
        <LogOutIcon className="w-6 h-6 text-black" />
      </div>
    </div>
  );
};

export default SidebarFooter;
