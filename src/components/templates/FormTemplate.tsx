import type {
    ReactNode,
    Ref,
  } from 'react'

  import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'
  import { useModalDialog } from '../../hooks/useModalDialog'

  interface FormTemplateProps {
    children: ReactNode
    ariaLabelledBy: string
    className?: string
    contentRef?: Ref<HTMLDivElement>
    onClose: () => void
  }

  export default function FormTemplate({
    children,
    ariaLabelledBy,
    className = '',
    contentRef,
    onClose,
  }: FormTemplateProps) {
    const dialogRef = useModalDialog<HTMLElement>(onClose)
    const panelClassName = [
      'add-plant-panel',
      'chronicle-panel',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <section
        ref={dialogRef}
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
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

