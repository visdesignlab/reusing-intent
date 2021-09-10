/* eslint-disable @typescript-eslint/ban-types */
import React, { FC } from 'react';

type LinkProps = {} & React.SVGProps<SVGLineElement>;

const Link: FC<LinkProps> = (props: LinkProps) => <line {...props} />;

export default Link;
