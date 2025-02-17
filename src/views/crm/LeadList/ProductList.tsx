import reducer from './store'
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import ProductTable from './components/ProductTable'

injectReducer('salesProductList', reducer)


const ProductList = () => {
    return (
      
        <AdaptableCard className="h-full" bodyClass="h-full">
            <ProductTable />
        </AdaptableCard>
    )
}

export default ProductList
