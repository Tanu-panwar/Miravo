// withAuth.tsx

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * HOC to protect a page/component by checking JWT token in localStorage.
 * If no token is found, user is redirected to the login page.
 *
 * @param WrappedComponent - The component to protect
 * @returns A new component with auth protection
 */
const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        // Redirect to login if token is missing
        router.replace("/login");
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  // For easier debugging in React DevTools
  ComponentWithAuth.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAuth;
};

export default withAuth;
