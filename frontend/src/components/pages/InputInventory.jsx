import InputInventoryForm from "../InputInventoryForm";
import { useLocation, useNavigate } from "react-router-dom";

export default function InputInventory(){
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, item } = location.state || { mode: "add", item: null };
  const isEditMode = mode === "edit";  

  return(
    <div>
      <div className="text-nunito font-bold text-4xl  text-black mb-10 font-nunito">
        {isEditMode ? "Edit Product" : "Add a Product"}
      </div>
        <InputInventoryForm/>
    </div>

  )


}