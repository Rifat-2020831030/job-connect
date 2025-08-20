import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const Popup = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  message = '', 
  title = '' 
}) => {
  if (!isOpen) return null;

  const configs = {
    success: {
      icon: CheckCircleIcon,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      defaultTitle: 'Success!',
      defaultMessage: 'You have been successfully subscribed to our newsletter.'
    },
    error: {
      icon: XCircleIcon,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      defaultTitle: 'Oops!',
      defaultMessage: 'Something went wrong. Please try again.'
    }
  };

  const config = configs[type] || configs.success;
  const Icon = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className={`
            relative max-w-md w-full ${config.bgColor} rounded-lg shadow-xl 
            border ${config.borderColor} transform transition-all
            animate-in fade-in-0 zoom-in-95 duration-300
          `}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="p-6">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <Icon className={`h-12 w-12 ${config.iconColor}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${config.titleColor} mb-1`}>
                  {title || config.defaultTitle}
                </h3>
                <p className={`text-sm ${config.messageColor}`}>
                  {message || config.defaultMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;