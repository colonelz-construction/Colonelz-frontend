import { StickyFooter } from '@/components/shared'
import { Button } from '@/components/ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate=useNavigate()    
  return (
    <StickyFooter
              className="-mx-8 px-8 flex items-center justify-between py-4 mt-7"
              stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
              <div className="md:flex items-center">
                  <Button
                      size="sm"
                      className="ltr:mr-3 rtl:ml-3"
                      type="button"
                      onClick={() => {
                          navigate('/app/crm/fileManager')
                      }}
                  >
                      Back
                  </Button>
              </div>
          </StickyFooter>
  )
}

export default Footer