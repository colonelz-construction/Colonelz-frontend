import React, { useState } from 'react'
import ReactQuill,{Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import ImageResize from 'quill-image-resize-module-react'
Quill.register('modules/imageResize', ImageResize)
interface RichTextEditorProps {
    value: string
    onChange: (content: string) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    // console.log(value)

    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');

    const img = doc.querySelector('img');
    if (img) {
      img.setAttribute('width', '20');
      img.setAttribute('style', 'cursor: nwse-resize;');
    }

    const updatedValue = doc.body.innerHTML;

    // console.log('Updated value:', updatedValue);


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
