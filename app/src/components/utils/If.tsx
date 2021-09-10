import { FC, memo, ReactNode } from 'react';

type Props = {
  condition: boolean;
  else?: ReactNode | (() => ReactNode);
  children: ReactNode;
};

const If: FC<Props> = ({ condition, children, else: elseComponent = null }) => {
  if (!condition) {
    if (typeof elseComponent === 'function') return elseComponent();

    return elseComponent;
  }

  return <>{children}</>;
};

export default memo(If);
