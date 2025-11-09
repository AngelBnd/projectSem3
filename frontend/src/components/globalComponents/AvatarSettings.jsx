import { SettingsIcon, NotificationsIcon } from "../../assets/SvgIcons"
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";

export default function AvatarSettings (){
    const [user, setUser] = useState({ username: "", role: "" });
    useEffect(() => {
        const currentUser = getCurrentUser();
        console.log(currentUser)

        if(currentUser){
            setUser({
            username: currentUser.username,
            role: currentUser.primaryRole
            });
        }
    }, []);

    return(
    <div className="flex items-center justify-between border-gray-200 gap-5">
        <div className="flex gap-5 items-center">
            <div className="cursor-pointer">
                <NotificationsIcon/>
            </div>
            
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden inline-block mr-2">
                <img
                    src="/path/to/profile.jpg"
                    alt="User"
                    className="w-full h-full object-cover bg-gray-500"
                />
                </div>
                <div>
                <div className="text-black text-sm font-nunito">{user.username}</div>
                <div className="text-gray-500 text-xs">{user.role}</div>
                </div>
            </div>
        </div>


        <div
            className="cursor-pointer ml-2"
            onClick={() => console.log('Open settings')}
        >
            <SettingsIcon/>
        </div>
    </div>
    )
}