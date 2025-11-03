import IMG from "../../assets/notFound.jpeg";

export default function notFound (){
    return (
        <tr>
            <td colSpan="7" className ="text-center">
                <img src={IMG} className="mx-auto w-32 opacity-70"></img>
                <p className="text-gray-500 py-4">No items found.</p>
            </td>
        </tr>
    )
}