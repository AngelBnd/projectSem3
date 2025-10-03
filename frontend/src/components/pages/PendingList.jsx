import PendingListRow from "../PendingListRow"

export default function PendingList(){

    const dummies = [2,3,4,5,6]

    return(
    <div>
      <div className="text-nunito font-bold text-4xl  text-black mb-10 font-nunito">
        Pending List
      </div>

    <div className="w-full overflow-y-auto h-[374px] custom-scrollbar">
        <table className="table-auto w-full border-separate border-spacing-y-3 font-nunito text-[14px]">
            <thead className="text-gray-600 text-sm">
            <tr>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Code</th>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Name</th>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Category</th>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Quantity</th>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Last Updated</th>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Status</th>
                <th className="w-1/6 px-6 py-2 font-bold text-center">Action</th>
            </tr>
            </thead>
            <tbody>
                {dummies.map((item, index)=>{
                    return(
                        <PendingListRow
                        key={index}
                        item={item}
                        />
                    )
                })}
            </tbody>
        </table>
    </div>
    
    </div>
    )
}