import {IndexPage} from '@/components/IndexPage';

export default function PaymentPage() {

    return (
        <div>
        <form className="price-form flex w-10 border-double border-green-600 rounded-md drop-shadow-xl ">
            <input type="number" name="price" placeholder="$0.00"/>
        </form>
        <IndexPage/>
        </div>
    )
}