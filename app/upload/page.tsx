import { ProtectedPage } from "@/components/layout/protected-page";
import { UploadForm } from "@/components/prescriptions/upload-form";
import { getTrackedPeople } from "@/services/family-service";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const people = await getTrackedPeople();

  return (
    <ProtectedPage>
      <UploadForm people={people} />
    </ProtectedPage>
  );
}
