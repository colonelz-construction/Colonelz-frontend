import Task from './Task'
import { Tasks } from '../../CustomerDetail/store';
type Data = {
  task: Tasks[]
  users: string[]
}


const Index = ({ task, users }: Data) => {
  return (
    <div><Task task={task} users={users} /></div>
  )
}

export default Index