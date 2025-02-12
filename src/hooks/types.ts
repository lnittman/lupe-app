import { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export interface ToastState {
  toasts: ToasterToast[]
}
