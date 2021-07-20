import { useState } from "react";

export const useForceUpdate = () => {
  const setValue = useState(0);
  return () => setValue[1]((value) => value + 1);
};
