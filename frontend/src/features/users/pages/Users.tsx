import Button from "../../../components/globalComponents/Button";
import FilterTabs from "../../../components/globalComponents/FilterTabs";
import { hasPermission, getCurrentUser } from "../../../utils/auth";
import { EmailIcon, PhoneIcon } from "../../../assets/SvgIcons";
import { useState } from "react";
import { UserCard } from "../components/UserCard";
import { approveUser, fetchUsers, rejectUser } from "../api";
import type { ManagedUser } from "../../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function Users() {
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const users = data?.users ?? [];
  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleApprove = async (userId: ManagedUser["userId"]) => {
    await approveMutation.mutateAsync(userId);
  };

  const handleReject = async (userId: ManagedUser["userId"]) => {
    await rejectMutation.mutateAsync(userId);
  };

  const tabs = [
    {
      label: "Active",
      filterFn: (users: ManagedUser[]) => users.filter((u) => u.status === "ACTIVE"),
    },
    {
      label: "Pending",
      filterFn: (users: ManagedUser[]) => users.filter((u) => u.status === "PENDING_APPROVAL"),
    },
    {
      label: "Rejected",
      filterFn: (users: ManagedUser[]) => users.filter((u) => u.status === "REJECTED"),
    },
    {
      label: "Suspended",
      filterFn: (users: ManagedUser[]) => users.filter((u) => u.status === "SUSPENDED"),
    },
  ];

  const filteredUsers = tabs[activeTab]?.filterFn(users) || users;

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error fetching users: {error.message}</div>;

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full">
        <h1 className="text-2xl font-semibold font-nunito">Users</h1>
        <h3 className="text-[#777B7C] text-sm">
          Overview of your store's employees
        </h3>
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between sm:items-start">
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(label) => setActiveTab(label)}
        />
      </div>

      <div className="col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.userId}
            employee={user}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
