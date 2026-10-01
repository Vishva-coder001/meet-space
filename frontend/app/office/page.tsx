import dynamic from "next/dynamic";

const OfficeWorkspace = dynamic(() => import("@/components/office/OfficeWorkspace").then(module => module.OfficeWorkspace), { ssr: false });

export default function OfficePage() { return <OfficeWorkspace/>; }
