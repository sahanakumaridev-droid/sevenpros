import { Outlet, useLocation } from "react-router-dom";

function stageClass(pathname) {
  if (pathname.startsWith("/book/")) return "page-stage page-stage-forward";
  if (pathname.startsWith("/providers/")) return "page-stage page-stage-sheet";
  if (pathname === "/login" || pathname === "/signup") return "page-stage page-stage-fade";
  return "page-stage page-stage-fade";
}

export default function PageStage() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={stageClass(pathname)}>
      <Outlet />
    </div>
  );
}
