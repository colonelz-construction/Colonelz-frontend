import React from 'react';
import { HiPlusCircle, HiEye, HiPencilAlt, HiTrash, HiCheck } from 'react-icons/hi';
import classNames from 'classnames';
import { Segment } from '@/components/ui';
import useThemeClass from '@/utils/hooks/useThemeClass';
import useDarkMode from '@/utils/hooks/useDarkmode';

type Permission = 'create' | 'read' | 'update' | 'delete' | 'restore';

type SelectorProps = {
    field: any;
    form: any;
    setCheckType: any;
    checkType: any;
};

const permissionsMap: { [key: string]: Permission[] } = {
    default: ['create', 'read', 'update', 'delete'],
    task: ['create', 'read', 'update', 'delete'],
    role: ['create', 'read', 'update', 'delete'],
    file:['create','read','delete'],
    archive: ['read', 'restore','delete'],
    addMember: ['create', 'delete'],
    lead: ['create', 'read', 'update', 'delete'],
    project: ['create', 'read', 'update'],
    mom: ['create', 'read', 'update', 'delete'],
    contract: ['create', 'read','update'],
    quotation: [ 'read','update'],
    user: [ 'create','read', 'update', 'delete'],
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

const Selector = ({ field, form, setCheckType, checkType }: SelectorProps) => {
    const permissions = permissionsMap[field.name] || permissionsMap.default;
    const {  bgTheme } = useThemeClass()
    const [isDark, setIsDark] = useDarkMode()

    const handleChange = (permission: Permission) => {
        const newValue = field.value.includes(permission)
            ? field.value.filter((p: Permission) => p !== permission)
            : [...field.value, permission];


            if(newValue.length == permissionsMap[field.name].length) {

                setCheckType({...checkType, [field.name]: true})

            } else {
                setCheckType({...checkType, [field.name]: false})

            }

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
                            ? perm === 'create' ? `${bgTheme} ${!isDark && "text-white hover:text-gray-700"}` :
                              perm === 'read' ? `${bgTheme} ${!isDark && "text-white hover:text-gray-700"}` :
                              perm === 'update' ? `${bgTheme} ${!isDark && "text-white hover:text-gray-700"}` :
                              perm === 'restore' ? `${bgTheme} ${!isDark && "text-white hover:text-gray-700"}` :
                              `${bgTheme} ${!isDark && "text-white hover:text-gray-700"}`
                            : `bg-gray-100 text-gray-700 ${isDark && "hover:text-white" } `
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