import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        let pageTitle = "";

        // Determine title based on path for top-level routes
        if (location.pathname === "/") {
            pageTitle = "Home";
        } else if (location.pathname === "/user") {
            pageTitle = "User Info";
        } else if (location.pathname === "/patient-monitor") {
            pageTitle = "Patient Monitor";
        } else if (location.pathname === "/nurse-monitor") {
            pageTitle = "Nurse Monitor";
        } else if (location.pathname === "/admin") {
            pageTitle = "Admin";
        } else if (location.pathname === "/administration") {
            pageTitle = "Administration";
        } else if (location.pathname === "/organization") {
            pageTitle = "Organization";
        } else if (location.pathname.startsWith("/patient-profile/") || location.pathname.startsWith("/patient/")) {
            // These will be handled by the components themselves for more specificity
            return;
        } else {
            // Fallback for any other routes
            const pathParts = location.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                pageTitle = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace(/-/g, ' ');
            }
        }

        if (pageTitle) {
            document.title = pageTitle;
        }
    }, [location]);

    return null; // This component doesn't render anything
};

export default TitleUpdater;
