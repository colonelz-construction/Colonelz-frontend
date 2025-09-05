import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'

interface NoDataProps {
    text?: string
}

const NoData = ({ text = "Data Not Found!" }: NoDataProps) => {
    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <DoubleSidedImage
                    src="/img/others/img-2.png"
                    darkModeSrc="/img/others/img-2-dark.png"
                    alt="Access Denied!"
                />
                <div className="mt-6 text-center">
                    <h3 className="mb-2">{text}</h3>
                    
                </div>
            </div>
        </Container>
    )
}

export default NoData
