import authRoute from './authRoute'
import appsRoute from './appsRoute'
import pagesRoute from './pagesRoute'
import authDemoRoute from './authDemoRoute'
import type { Routes } from '@/@types/routes'
import clientRoute from './clientRoute'

export const publicRoutes: Routes = [...authRoute,...clientRoute]

export const protectedRoutes: Routes = [
    ...appsRoute,]
