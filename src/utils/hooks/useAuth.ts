import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'

type Status = 'success' | 'failed'
export let tok: string | null=null

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential
    ) => {

            const resp =await apiSignIn(values)
            
            if (resp.code===200) {
                const { token } = resp.data
                tok=resp.data.token
                localStorage.setItem('loginTime',new Date().getTime().toString())
                dispatch(signInSuccess({ token, userId: resp.data.userID,role:resp.data.role,refreshToken:resp.data.refreshToken, orgId: resp.data.org_id }))
                if (resp.data) {
                    dispatch(
                        setUser(
                            {
                                authority: [resp.data.role],
                            }
                        )
                    )
                }
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : ( appConfig.authenticatedEntryPath)
                  )
                return {
                    status: 'success',
                    message: `${resp.errorMessage}`,
                }
            }
            else{
            return{
                status: 'failed',
                message: `${resp.errorMessage}`,
            }
            }
              
    }

    const signUp = async (values: SignUpCredential) => {
       const resp = await apiSignUp(values)
    return resp
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        window.location.reload()
        dispatch(
            setUser({
                authority: [],
            })
            )
            navigate(appConfig.unAuthenticatedEntryPath)
            window.location.reload()
    }

    const signOut = async () => {
       const response= await apiSignOut()
    handleSignOut()
    }
    const tokens=localStorage.getItem('auth')
    if (tokens) {
    setTimeout(signOut, 60*60*1000*2);
    }
    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
