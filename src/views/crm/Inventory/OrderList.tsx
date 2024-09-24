import reducer from './store'
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Filtering from './components/DataTable'

injectReducer('salesOrderList', reducer)

const OrderList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <Filtering />
        </AdaptableCard>
    )
}

export default OrderList
