import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";

interface ActiveLinkProps extends LinkProps {
  children: string;
  activeClassname: string;
}

const ActiveLink: React.FC<ActiveLinkProps> = ({
  children,
  activeClassname,
  ...rest
}) => {
  const { asPath } = useRouter();

  const className = asPath === rest.href ? activeClassname : "";

  return (
    <Link className={className} {...rest}>
      {children}
    </Link>
  );
};

export default ActiveLink;
