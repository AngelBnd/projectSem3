import { HourglassIcon, XIcon } from "../../../assets/SvgIcons";
import { Link } from "react-router-dom";

export default function AccessStatus() {
  const code = sessionStorage.getItem("accessStatusCode");
  const message = sessionStorage.getItem("accessStatusMessage");

  const content: Record<string, { title: string; description: string | null }> = {
    PENDING_APPROVAL: {
      title: "Request Pending",
      description: message,
    },
    REJECTED: {
      title: "Request Rejected",
      description: message,
    },
  };

  const current = content[code ?? ""] ?? {
    title: "Access Restricted",
    description: "Your account cannot access this system.",
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center text-black">
      <div className="flex flex-col gap-1 items-end">
        <div className="flex flex-col bg-white rounded-md shadow w-[340px] h-[400px] justify-center items-center text-center px-8 gap-1">
          <div className="flex flex-col gap-4 items-center justify-center">
            {code === "PENDING_APPROVAL" ? (
              <HourglassIcon className="w-20 h-16 text-[#3376FC] animate-slow-spin" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-500 text-[#ec0f0f] bg-opacity-15 flex items-center justify-center p-4 ">
                <XIcon className="w-16 h-16 text-[#ec0f0f]" />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="font-bold text-2xl font-nunito">
                {current.title}
              </div>
              <div className="text-sm">{current.description}</div>
            </div>
          </div>
        </div>
        <Link to="/login" className="underline text-[#3376FC] text-sm">
          Return
        </Link>
      </div>
    </div>
  );
}
