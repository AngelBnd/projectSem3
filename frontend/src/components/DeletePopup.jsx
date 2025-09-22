export default function DeletePopup({ closePopup, item, onDelete }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white py-4 px-12 rounded-lg justify-center items-center flex flex-col">
                <h2 className = "text-gray-600">Are you sure you want to delete</h2>
                <h3 className = "text-gray-600">{item.productName || item.invoiceId} ?</h3>
                <div className = "mt-4 gap-4 flex">
                    <button className="px-5 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick ={() => {
                        onDelete(item);
                    }}>
                        Delete
                    </button>
                    <button className="px-5 py-1 bg-gray-300 text-black rounded-full hover:bg-gray-400"
                    onClick ={() => {
                        closePopup();
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};