import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import MediaSkeleton from '@/components/shared/loaders/MediaSkeleton'
import Loading from '@/components/shared/Loading'
import { NumericFormat } from 'react-number-format'

export const StatisticCard: React.FC<{
    icon: React.ReactElement;
    avatarClass: string;
    label: string;
    value: any;
    loading: boolean;
    onClick?: () => void;
}> = ({ icon, avatarClass, label, value, loading, onClick }) => {
    const avatarSize = 55;

    return (
        <Card bordered>
            <Loading
                loading={loading}
                customLoader={
                    <MediaSkeleton
                        avatarProps={{
                            className: 'rounded',
                            width: avatarSize,
                            height: avatarSize,
                        }}
                    />
                }
            >
                <div
                    className="flex justify-between items-center"
                    style={{ cursor: onClick ? 'pointer' : 'default' }} 
                >
                    <div className="flex items-center gap-4">
                        <Avatar
                            className={avatarClass}
                            size={avatarSize}
                            icon={icon}
                        />
                        <div>
                            <span>{label}</span>
                            <h3>
                                <NumericFormat
                                    thousandSeparator
                                    displayType="text"
                                    value={value}
                                />
                            </h3>
                        </div>
                    </div>
                </div>
            </Loading>
        </Card>
    );
};



