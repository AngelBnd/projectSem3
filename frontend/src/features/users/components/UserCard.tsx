import Button from "../../../components/globalComponents/Button";
import { hasPermission } from "../../../utils/auth";
import { EmailIcon, PhoneIcon } from "../../../assets/SvgIcons";
import type { ManagedUser } from "../../../types";

interface UserCardProps {
    employee: ManagedUser;
    onApprove: (userId: ManagedUser["userId"]) => void;
    onReject: (userId: ManagedUser["userId"]) => void;
}

export const UserCard = ({ employee, onApprove, onReject }: UserCardProps) => {
    const canEdit = hasPermission("user", "update");
    const showActions = canEdit && employee.status !== "ACTIVE" ;
    const isAlrRejected = employee.status === "REJECTED";

    return (
        <div className="col-span-1 bg-white rounded-sm px-6 py-7 shadow-sm  border-gray-100">
            <div className="flex flex-col gap-3 items-center mb-4">
                <div className="bg-gray-300 w-12 h-12 rounded-full">
                    {/* PICTURE HERE KATER*/}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col items-center text-center font-nunito font-bold text-sm">
                        {employee.firstName} {employee.lastName}
                    </div>
                    <div className="flex flex-col items-center text-center font-nunito text-gray-400 text-sm">
                        {/* {employee.roles.join(", ")} */}
                    </div>
                </div>
            </div>

           <div className={`flex flex-col gap-3 text-sm text-gray-700 border-t pt-4 ${showActions ? "mb-5" : ""}`}>
                <div className="flex gap-2 text-gray-500 items-center">
                    <EmailIcon className={" w-5 h-5"}/>
                    {employee.email}
                </div>

               <div className="flex gap-2 text-gray-500 items-center">
                    <PhoneIcon className={" w-5 h-5"}/>
                    {employee.phoneNumber || "-"}
                </div>            
            </div>

            {showActions && (
                <div className="flex gap-2">
                <Button onClick={() => onApprove(employee.userId)} variant="primary" fullWidth>
                    Approve
                </Button>
                <Button onClick={() => onReject(employee.userId)} variant="secondary" fullWidth>
                    Reject
                </Button>
                </div>
            )}
        </div>
    );
};