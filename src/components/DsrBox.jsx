import React from 'react';
import { cn } from "@/lib/utils";

const DsrBox = ({ className, children, title }) => {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-md", className)}>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default DsrBox;
