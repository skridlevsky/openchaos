import { fetchPRsByAuthor } from "@/lib/prData";
import { NewspaperUserProfile } from "@/components/profile/NewspaperUserProfile";
import { NewspaperLayout } from "@/components/newspaper/NewspaperLayout";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function NewspaperUserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const result = await fetchPRsByAuthor(username);

  if (!result.ok) {
    return (
      <NewspaperLayout>
        <div className="np-archives">
          <p>{result.error}</p>
          <a href="/newspaper">← Back to OpenChaos</a>
        </div>
      </NewspaperLayout>
    );
  }

  const { open, merged } = result.data;

  return (
    <NewspaperLayout>
      <NewspaperUserProfile
        username={username}
        openPRs={open}
        mergedPRs={merged}
        homeHref="/newspaper"
        homeLabel="← Back to OpenChaos"
      />
    </NewspaperLayout>
  );
}
