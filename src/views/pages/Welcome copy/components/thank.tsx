import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import Button from '@/components/ui/Button'
import type { CallbackSetSkip } from '../types'

type Step1Props = CallbackSetSkip

const Thank = ({ onNext, onSkip }: Step1Props) => {
    return (
        <div className="text-center">
            <DoubleSidedImage
                className="mx-auto mb-8"
                src="/img/others/welcome.png"
                darkModeSrc="/img/others/welcome-dark.png"
                alt="Welcome"
            />
            <h3 className="mb-2">
                Welcome on Board, lets get started with Elstar
            </h3>
            <p className="text-base">
                Telling us a bit about yourself to get the best experience, this
                will only take a minute or two.
            </p>
            <div className="mt-8 max-w-[350px] mx-auto">
               
            </div>
        </div>
    )
}

export default Thank
