import React from 'react';

const variantStyles = {
  primary: 'bg-[#3376FC] text-white hover:bg-blue-600 border border-[#3376FC]',
  outline: 'bg-white hover:bg-gray-50 border border-gray-300',
  secondary: 'bg-white hover:bg-gray-100 border border-gray-300 shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 border border-transparent', 
  danger: 'bg-red-500 text-white hover:bg-red-600 border border-red-500',
};

const defaultHasBorder = ['primary', 'outline', 'secondary', 'danger'];


function Button({ 
  onClick, 
  className, 
  children, 
  icon: IconComponent, 
  variant = 'primary', 
  hasBorder 
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
        px-3 py-[5px] rounded-md shadow 
        transition font-nunito text-semibold text-[14px] 
        flex items-center justify-center 
        ${styles} 
        ${className}
      `}
    >
      {IconComponent && (
        <span className="mr-2 flex items-center">
          <IconComponent />
        </span>
      )}
      
      {children}
    </button>
  );
}

export default Button;