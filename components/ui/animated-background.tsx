'use client'
import { cn } from '@/lib/utils'
import { AnimatePresence, Transition, motion } from 'motion/react'
import {
  Children,
  cloneElement,
  ReactElement,
  HTMLAttributes,
  useState,
  useId,
} from 'react'

type AnimatedBackgroundChild = ReactElement<
  HTMLAttributes<HTMLElement> & {
    'data-id'?: string
    'data-checked'?: string
  }
>

export type AnimatedBackgroundProps = {
  children: AnimatedBackgroundChild[] | AnimatedBackgroundChild
  defaultValue?: string
  onValueChange?: (newActiveId: string | null) => void
  className?: string
  transition?: Transition
  enableHover?: boolean
}

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null)
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue)
  const uniqueId = useId()

  // Sync with defaultValue during render instead of in an effect
  if (defaultValue !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue)
    if (defaultValue !== undefined) {
      setActiveId(defaultValue)
    }
  }

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id)

    if (onValueChange) {
      onValueChange(id)
    }
  }

  return Children.map(children, (child: AnimatedBackgroundChild, index) => {
    const id = child.props['data-id']

    const interactionProps =
      id === undefined
        ? {}
        : enableHover
          ? {
              onMouseEnter: () => handleSetActiveId(id),
              onMouseLeave: () => handleSetActiveId(null),
            }
          : {
              onClick: () => handleSetActiveId(id),
            }

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative flex w-full', child.props.className),
        'data-checked': id !== undefined && activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {id !== undefined && activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className="z-10 w-full">{child.props.children}</div>
      </>,
    )
  })
}
