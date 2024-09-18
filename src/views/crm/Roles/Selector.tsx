import React from 'react';
import { HiPlusCircle, HiEye, HiPencilAlt, HiTrash, HiCheck } from 'react-icons/hi';
import classNames from 'classnames';
import { Segment } from '@/components/ui';
import useThemeClass from '@/utils/hooks/useThemeClass';

type Permission = 'create' | 'read' | 'update' | 'delete' | 'restore';

type SelectorProps = {
    field: any;
    form: any;
};

const permissionsMap: { [key: string]: Permission[] } = {
    default: ['create', 'read', 'update', 'delete'],
    task: ['create', 'read', 'update', 'delete'],
    file:['create','read','delete'],
    archive: ['read', 'restore','delete'],
    addMember: ['create'],
    lead: ['create', 'read', 'update'],
    project: ['create', 'read', 'update'],
    mom: ['create', 'read'],
    contract: ['create', 'read','update'],
    quotation: [ 'read','update'],
    user: [ 'create','read','delete'],
    userArchive:['read','restore','delete'],
    companyData:['read']

};

const icons = {
    create: <HiPlusCircle className="text-xl" />,
    read: <HiEye className="text-xl" />,
    update: <HiPencilAlt className="text-xl" />,
    delete: <HiTrash className="text-xl" />,
    restore: <HiPlusCircle className="text-xl" /> // Assuming restore uses the same icon as create
};

const Selector = ({ field, form }: SelectorProps) => {
    const permissions = permissionsMap[field.name] || permissionsMap.default;
    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

    const handleChange = (permission: Permission) => {
        const newValue = field.value.includes(permission)
            ? field.value.filter((p: Permission) => p !== permission)
            : [...field.value, permission];

        form.setFieldValue(field.name, newValue);
    };

    return (
        <Segment className="gap-2 md:flex-row flex-col">
            {permissions.map((perm) => (
                <Segment.Item
                    key={perm}
                    value={perm}
                    type="button"
                    onClick={() => handleChange(perm)}
                    className={classNames(
                        'flex items-center !rounded-md cursor-pointer',
                        field.value.includes(perm)
                            ? perm === 'create' ? `${bgTheme}` :
                              perm === 'read' ? `${bgTheme}` :
                              perm === 'update' ? `${bgTheme}` :
                              perm === 'restore' ? `${bgTheme}` :
                              `${bgTheme}`
                            : 'bg-gray-100 text-gray-700'
                    )}
                >
                    {icons[perm]}
                    <span className="ml-2">{perm}</span>
                    {field.value.includes(perm) && <HiCheck className="ml-2 text-green-700" />}
                </Segment.Item>
            ))}
        </Segment>
    );
};

export default Selector;