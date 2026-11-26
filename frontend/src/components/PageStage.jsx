import { Outlet, useLocation } from "react-router-dom";

function stageClass(pathname) {
  const motion = pathname.startsWith("/book/")
    ? "page-stage-forward"
    : pathname.startsWith("/providers/")
      ? "page-stage-sheet"
      : pathname === "/login" || pathname === "/signup"
        ? "page-stage-fade"
        : "page-stage-fade";
  const ink =
    pathname.startsWith("/admin") || /^\/providers\/[^/]+$/.test(pathname) ? "dark-theme" : "light-page";
  return `page-stage ${motion} ${ink}`;
}

export default function PageStage() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={stageClass(pathname)}>
      <Outlet />
    </div>
  );
}
