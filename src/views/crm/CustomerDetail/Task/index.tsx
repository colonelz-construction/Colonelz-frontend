import React, { useEffect, useState } from 'react'
import Task from './Task'
import { useLocation } from 'react-router-dom';
import { apiGetCrmProjectsTaskData } from '@/services/CrmService';
import { Tasks } from '../store';
type Data={
  task:Tasks[]
}

const Index = ({task}:Data) => {
  console.log(task);
  
  
  
  return (
    <div><Task task={task} /></div>
  )
}

export default Index