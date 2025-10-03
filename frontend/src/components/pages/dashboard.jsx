export default function Dashboard(){

  const dashboardBoxes = [
    { number: 0, label: "Profit Total" },
    { number: 0, label: "Expense Total" },
    { number: 0, label: "Order Total" },
    { number: 0, label: "Total Total" },
  ];

    return(
    <div className="w-full text-black">
      <div className="font-nunito font-bold text-4xl mb-[16px]">
        Dashboard
      </div>

      <div className="w-full flex flex-col gap-3 mb-[40px]">
        <div className="w-full h-32 flex gap-2">
            {dashboardBoxes.map((dashboardBox, index)=>(
                <div
                    key={index}
                    className="bg-white w-full h-full rounded-lg shadow flex flex-col items-start justify-center px-5"
                >
                    <span className="text-3xl font-bold font-nunito text-black flex items-end gap-1">
                    {/* {dashboardBox.label !== "Order Total" && (
                        <span className="text-lg font-bold font-nunito text-black">Rp</span>
                    )} */}
                        {/* {dashboardBox.label === "Order Total"
                        ? dashboardBox.number
                        : dashboardBox.number.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
                        {dashboardBox.number}
                    </span>
                <span className="text-sm text-gray-600">{dashboardBox.label}</span>
                </div>

            ))}
        </div>

        <div className=" w-full h-80 flex gap-2">
            <div className=" w-full h-80 flex gap-2">
                <div className="bg-white basis-2/3 rounded-lg shadow h-full">


                </div>

                <div className="bg-white basis-1/3 rounded-lg shadow h-full">
                
                </div>
            </div>
        </div>

        <div className=" w-full h-80 flex gap-2">
            <div className="bg-white basis-1/3 rounded-lg shadow h-full">
            
            </div>

            <div className="bg-white basis-2/3 rounded-lg shadow h-full">
            
            </div>
        </div>

      </div>
    </div>
    )
}