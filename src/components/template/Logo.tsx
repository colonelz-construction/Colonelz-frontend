import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'
import img from './logoback.png'
import { useEffect, useState } from 'react'
import { apiGetOrgData } from '@/services/CrmService'


interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const LOGO_SRC_PATH = '/img/logo/'
// const response = await apiGetOrgData();

const Logo = (props: LogoProps) => {

    const [file, setFile] = useState<any>('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetOrgData();
                // setDetails(response.data);
                setFile(response.data.org_logo)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [])
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
    } = props

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <img src={file} alt=""  className='w-[64%] my-4 mx-auto' />
        </div>
    )
}

export default Logo
