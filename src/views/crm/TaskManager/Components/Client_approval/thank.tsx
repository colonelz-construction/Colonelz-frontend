import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import Button from '@/components/ui/Button'



const Thank = ({data}:any) => {
    return (
        <div className="text-center">
            <DoubleSidedImage
                className="mx-auto mb-8"
                src="/img/others/welcome.png"
                darkModeSrc="/img/others/welcome-dark.png"
                alt="Welcome"
            />
           
            <p className="text-base">
                {data}
            </p>
            <div className="mt-8 max-w-[350px] mx-auto">
               
            </div>
        </div>
    )
}

export default Thank
