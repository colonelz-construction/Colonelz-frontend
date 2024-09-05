import classNames from 'classnames'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import {
    HiUserCircle,
    HiMail,
    HiDocumentText,
    HiCalendar,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
} from 'react-icons/hi'
import {FcTodoList} from 'react-icons/fc'
import {GrInProgress} from 'react-icons/gr'
import {MdOutlineVerified} from 'react-icons/md'
import type { Statistic } from '../store'
import { useProjectContext } from '../../Customers/store/ProjectContext'
import { Skeleton } from '@/components/ui'



const StatisticIcon = ({ type }: { type?: string }) => {
    switch (type) {
        case 'toDo':
            return (
                <Avatar
                    size={55}
                    className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
                    icon={<FcTodoList />}
                />
            )
        case 'inProgress':
            return (
                <Avatar
                    size={55}
                    className="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-100"
                    icon={<GrInProgress />}
                />
            )
        case 'inReview':
            return (
                <Avatar
                    size={55}
                    className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                    icon={<HiDocumentText />}
                />
            )
        case 'completed':
            return (
                <Avatar
                    size={55}
                    className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100"
                    icon={<MdOutlineVerified />}
                />
            )
        default:
            return <div></div>
    }
}

const StatisticCard = ({ data = {} }: { data: Partial<Statistic> }) => {
    const {loading}=useProjectContext()
    console.log(loading);
    
    return (
        <Card>
            <div className="flex items-center gap-4">
                <StatisticIcon type={data.key} />
                <div>
                    <div className="flex gap-1.5 items-end mb-2">
                        {loading ? <Skeleton width={60}/> : <h3 className="font-bold leading-none">{data.value}</h3>}
                       {loading ? <Skeleton width={60}/> : <p className="text-sm text-gray-500 dark:text-gray-400">{data.label}</p>}
                        
                    
                    </div>
                    {/* <p className="flex items-center gap-1">
                        <GrowShrink value={data.growShrink || 0} />
                        <span>this month</span>
                    </p> */}
                </div>
            </div>
        </Card>
    )
}

const Statistic = ({ data = [] }: { data?: Partial<Statistic>[] }) => {
    return (
        <div className=''>
             <h3 className='mb-8'>Projects Status</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
              
            {data.map((card) => (
                <StatisticCard key={card.key} data={card} />
            ))}
        </div> 
        </div> 
    )
}

export default Statistic
