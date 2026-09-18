import type {
    ReactNode,
    Ref,
  } from 'react'
  
  import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'
  
  interface FormTemplateProps {
    children: ReactNode
    ariaLabelledBy: string
    className?: string
    contentRef?: Ref<HTMLDivElement>
  }
  
  export default function FormTemplate({
    children,
    ariaLabelledBy,
    className = '',
    contentRef,
  }: FormTemplateProps) {
    const panelClassName = [
      'add-plant-panel',
      'chronicle-panel',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  
    return (
      <section
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        <img
          className="chronicle-page-image"
          src={notebookEntryBackground}
          alt=""
          aria-hidden="true"
        />
  
        <div
          ref={contentRef}
          className="chronicle-content"
        >
          {children}
        </div>
      </section>
    )
  }
  