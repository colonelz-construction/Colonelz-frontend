import React from 'react'
import ReactQuill,{Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import ImageResize from 'quill-image-resize-module-react'
Quill.register('modules/imageResize', ImageResize)
interface RichTextEditorProps {
    value: string
    onChange: (content: string) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['clean']
        ],
        imageResize: {
            modules: [ 'Resize', 'DisplaySize','Toolbar'],
            handleStyles: {
                backgroundColor: 'black',
                border: 'none',
                color: 'FFFFFF'
            }
         }
    }

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background',
        'align',
        'script'
    ]

    return (
        <div className="rich-text-editor">
            <ReactQuill
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                theme="snow"
            />
        </div>
    )
}

export default RichTextEditor
