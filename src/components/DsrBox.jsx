import React from 'react';
import { cn } from "@/lib/utils";

const DsrBox = ({ className, children, title }) => {
  return (
    <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md", className)}>
      {title && <h2 className="text-xl font-semibold mb-4 dark:text-white">{title}</h2>}
      <div className="dark:text-gray-200">{children}</div>
    </div>
  );
};

export default DsrBox;
