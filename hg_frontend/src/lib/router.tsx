"use client";

import LinkBase from "next/link";
import { useParams as useNextParams, usePathname, useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const NAV_STATE_KEY = "holygrill-nav-state";

type NavigateOptions = { replace?: boolean; state?: unknown };

type NavLocation = { pathname: string; state: unknown };

function isExternalUrl(to: string) {
  return /^(https?:|mailto:|tel:)/.test(to);
}

function normalizePath(to: string) {
  return to.split("?")[0].split("#")[0] || "/";
}

function saveNavState(path: string, state: unknown) {
  if (typeof window === "undefined") return;
  const key = normalizePath(path);
  const raw = window.sessionStorage.getItem(NAV_STATE_KEY);
  const current = raw ? JSON.parse(raw) : {};
  current[key] = state;
  window.sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(current));
}

function readNavState(pathname: string) {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(NAV_STATE_KEY);
  if (!raw) return null;
  const current = JSON.parse(raw);
  return current[pathname] ?? null;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  replace?: boolean;
  state?: unknown;
  prefetch?: boolean;
  children?: ReactNode;
}

export function Link({ to, replace, state, onClick, children, prefetch, ...props }: LinkProps) {
  const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"] = (event) => {
    if (state !== undefined) saveNavState(to, state);
    onClick?.(event);
  };

  if (isExternalUrl(to)) {
    return (
      <a href={to} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }

  return (
    <LinkBase href={to} replace={replace} onClick={handleClick} prefetch={prefetch} {...props}>
      {children}
    </LinkBase>
  );
}

type NavLinkRenderProps = { isActive: boolean; isPending: boolean };
export type NavLinkProps = Omit<LinkProps, "className" | "children"> & {
  end?: boolean;
  className?: string | ((props: NavLinkRenderProps) => string);
  children?: ReactNode | ((props: NavLinkRenderProps) => ReactNode);
};

export function NavLink({ end, className, children, to, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const renderProps: NavLinkRenderProps = { isActive, isPending: false };

  return (
    <Link
      to={to}
      className={typeof className === "function" ? className(renderProps) : className}
      {...props}
    >
      {typeof children === "function" ? children(renderProps) : children}
    </Link>
  );
}

export function useNavigate() {
  const router = useRouter();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      else router.forward();
      return;
    }

    if (options?.state !== undefined) saveNavState(to, options.state);
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation(): NavLocation {
  const pathname = usePathname();
  return { pathname, state: readNavState(pathname) };
}

export function useParams<T extends Record<string, string | string[]>>() {
  return useNextParams<T>();
}
