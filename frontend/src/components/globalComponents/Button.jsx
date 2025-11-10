import React from 'react';

const variantStyles = {
  primary: 'bg-[#3376FC] text-white hover:bg-blue-600 active:bg-[#3376FC] border border-[#3376FC]',
  white: 'bg-white hover:bg-gray-50 active:bg-white border border-gray-300',
  primaryAlt: 'bg-[#36383C] text-white hover:bg-gray-600 active:bg-[#36383C] border border-gray-300 shadow-sm',
  secondary: 'bg-transparent  hover:bg-transparent active:bg-transparent border border-2 border-[#36383C]',
  tertiary: 'bg-transparent  hover:bg-transparent !active:bg-transparent border shadow-none underline',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-500 border border-red-500',
};

const defaultHasBorder = ['primary', 'white', 'primaryAlt', 'danger', 'secondary'];

function Button({ 
  onClick, 
  className, 
  children, 
  icon: IconComponent, 
  variant = 'primary', 
  hasBorder,
  iconPosition = 'left',
  fullWidth = false, 
}) {

  let styles = variantStyles[variant] || variantStyles.primary;

  const showBorder = hasBorder !== undefined ? hasBorder : defaultHasBorder.includes(variant);

  if (!showBorder) {
    styles = styles.replace(/border(-[^\s]+)?/g, '').trim();
  }

  return (
    <button
      onClick={onClick}
      className={`
        focus:outline-none !focus:ring-0 !focus-visible:outline-none 
        px-3 py-[5px] rounded-md shadow active:bg-inherit  
        transition font-nunito text-semibold text-[14px] 
        flex items-center justify-center 
        ${fullWidth ? 'w-full' : ''} 
        ${styles} 
        ${className}
      `}
    >
      {IconComponent && iconPosition === 'left' && (
        <span className="mr-2 flex items-center">
          <IconComponent className="w-4 h-4 text-inherit fill-current stroke-current" />
        </span>
      )}

      {children}

      {IconComponent && iconPosition === 'right' && (
        <span className="ml-2 flex items-center">
          <IconComponent className="w-4 h-4 text-inherit fill-current stroke-current" />
        </span>
      )}
    </button>
  );
}

export default Button;
