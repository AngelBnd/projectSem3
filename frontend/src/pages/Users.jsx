import Button from "../components/globalComponents/Button";
import FilterTabs from "../components/globalComponents/FilterTabs";
import { hasPermission, getCurrentUser } from "../utils/auth";
import { EmailIcon, PhoneIcon } from "../assets/SvgIcons";
import { useEffect, useState } from "react";
import { UserCard } from "../components/localComponents/UserCard";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://stockapi.jessfortress.com/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    };
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    const token = localStorage.getItem("token");
    await fetch(`https://stockapi.jessfortress.com/api/users/${userId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, status: "ACTIVE" } : u))
    );
  };

  const handleReject = async (userId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/users/${userId}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.success) {
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? data.user : u))
      );
    }
  };

  useEffect(() => {
    console.log(`TESSSSTTTT`, users);
  }, [users]);

  const tabs = [
    {
      label: "Active",
      filterFn: (users) => users.filter((u) => u.status === "ACTIVE"),
    },
    {
      label: "Pending",
      filterFn: (users) => users.filter((u) => u.status === "PENDING_APPROVAL"),
    },
    {
      label: "Rejected",
      filterFn: (users) => users.filter((u) => u.status === "REJECTED"),
    },
    {
      label: "Suspended",
      filterFn: (users) => users.filter((u) => u.status === "SUSPENDED"),
    },
  ];

  const filteredUsers = tabs[activeTab]?.filterFn(users) || users;

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
