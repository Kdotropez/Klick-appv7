import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, className, onClick, as = 'button', ...props }) => {
    const Tag = as;
    const combinedClassName = `button ${className || ''}`.trim();
    const handleClick = (e) => {
        console.log('Button clicked:', { children, className, event: e.type });
        if (onClick) onClick(e);
    };
    return (
        <Tag className={combinedClassName} onClick={handleClick} {...props}>
            {children}
        </Tag>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func,
    as: PropTypes.string
};

export default Button;