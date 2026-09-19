import {
  useEffect,
  useRef,
  type RefObject,
} from 'react'


const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')


/**
 * Gives custom modal panels the keyboard behaviour people expect:
 * focus enters the panel, Tab stays inside it, Escape closes it, and
 * focus returns to the control that opened it.
 */
export function useModalDialog<T extends HTMLElement>(
  onClose: () => void,
  isOpen = true,
): RefObject<T | null> {
  const dialogRef = useRef<T>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    const dialogElement = dialog

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const hiddenSiblings: Array<{
      element: HTMLElement
      inert: boolean
      ariaHidden: string | null
    }> = []

    let branch: HTMLElement | null = dialogElement

    while (branch?.parentElement && branch.parentElement !== document.body) {
      const parent: HTMLElement = branch.parentElement

      for (const sibling of Array.from(parent.children)) {
        if (sibling === branch || !(sibling instanceof HTMLElement)) {
          continue
        }

        hiddenSiblings.push({
          element: sibling,
          inert: sibling.inert,
          ariaHidden: sibling.getAttribute('aria-hidden'),
        })
        sibling.inert = true
        sibling.setAttribute('aria-hidden', 'true')
      }

      branch = parent
    }

    const focusableElements = () =>
      Array.from(
        dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(element =>
        !element.hasAttribute('hidden') &&
        element.getAttribute('aria-hidden') !== 'true' &&
        element.getClientRects().length > 0,
      )

    const initialFocus =
      dialogElement.querySelector<HTMLElement>('[data-dialog-initial-focus]') ??
      focusableElements()[0] ??
      dialogElement

    const focusFrame = window.requestAnimationFrame(() => {
      initialFocus.focus()
    })

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const elements = focusableElements()

      if (elements.length === 0) {
        event.preventDefault()
        dialogElement.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialogElement.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      dialogElement.removeEventListener('keydown', handleKeyDown)

      for (const item of hiddenSiblings) {
        item.element.inert = item.inert

        if (item.ariaHidden === null) {
          item.element.removeAttribute('aria-hidden')
        } else {
          item.element.setAttribute('aria-hidden', item.ariaHidden)
        }
      }

      if (previouslyFocused?.isConnected) {
        window.requestAnimationFrame(() => previouslyFocused.focus())
      }
    }
  }, [isOpen])

  return dialogRef
}
