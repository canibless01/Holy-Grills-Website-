import React from "react";

const Divider = () => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-background px-3 text-muted-foreground font-body">
          or
        </span>
      </div>
    </div>
  );
};

export default Divider;
