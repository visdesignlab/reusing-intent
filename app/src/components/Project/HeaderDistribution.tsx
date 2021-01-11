import { observer } from 'mobx-react';
import React, { FC } from 'react';

import { CategoricalDistribution, Column } from '../../Store/Dataset';

type CategoricalHeaderProps = {
  info: CategoricalDistribution;
  width: number;
  height: number;
};

const CategoricalHeader: FC<CategoricalHeaderProps> = ({
  info,
  width,
  height,
}: CategoricalHeaderProps) => {
  return (
    <div>
      {Object.keys(info).length} {width} {height}
    </div>
  );
};

type Props = {
  width: number;
  height: number;
  column: Column;
};

const HeaderDistribution: FC<Props> = ({ column, width, height }: Props) => {
  const { dataType, fullname } = column;

  if (dataType === 'id' || dataType === 'label') return <>{fullname}</>;

  console.log(column.dataType);

  if (column.dataType === 'categorical')
    return <CategoricalHeader height={height} info={column.info} width={width} />;

  return <div>Custom</div>;
};

export default observer(HeaderDistribution);
