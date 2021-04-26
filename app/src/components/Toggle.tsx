import { useState } from 'react';

function useToggle(id: string, label: string, defaultState = false) {
  const [state, setState] = useState(defaultState);

  const Toggle = () => <div>Test</div>;

  return { state, Toggle, setState };
}

export default useToggle;
