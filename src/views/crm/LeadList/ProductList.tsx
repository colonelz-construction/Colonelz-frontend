import reducer from './store'
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import ProductTable from './components/ProductTable'
import ProductTableTools from './components/ProductTableTools'
import { AuthorityCheck } from '@/components/shared'
import { fetchRoleAccessData } from '../Roles/roleData'
import { RoleAccessData } from '@/@types/navigation'

injectReducer('salesProductList', reducer)


const ProductList = () => {
    return (
      
        <AdaptableCard className="h-full" bodyClass="h-full">
         
            <ProductTable />
        </AdaptableCard>
    )
}

export default ProductList
