import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
  const Icon = type === 'success' ? CheckCircle : XCircle

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
        <Icon size={20} />
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded p-1 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default Toast






