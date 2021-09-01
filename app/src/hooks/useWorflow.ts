import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function useWorkflowFromURL() {
  const [workflow, setWorkflow] = useState<string | null>(null);

  const location = useLocation();
  const history = useHistory();
  const search = new URLSearchParams(location.search);
  const wf = search.get('workflow');

  useEffect(() => {
    const wf_to_set = wf ? wf : Date.now().toString();

    if (workflow === wf_to_set) return;
    setWorkflow(wf_to_set);

    history.replace({
      search: `?workflow=${wf_to_set}`,
    });
  }, [wf, workflow, history]);

  return { history, location, workflow };
}
export default useWorkflowFromURL;
