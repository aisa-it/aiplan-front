import { STATES_GROUPS } from 'src/constants/constants';

export const sortStates = (states: any[]) => {
  const groupOrder = STATES_GROUPS;
  return (
    states.sort(
      (a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group),
    ) ?? []
  );
};
