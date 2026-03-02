import { fetchPRsByAuthor } from "@/lib/prData";
import { AsciiUserProfile } from "@/components/profile/AsciiUserProfile";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function AsciiUserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const result = await fetchPRsByAuthor(username);

  if (!result.ok) {
    return (
      <div>
        <p>{result.error}</p>
        <a href="/ascii">← Back to OpenChaos</a>
      </div>
    );
  }

  const { open, merged } = result.data;

  return (
    <AsciiUserProfile
      username={username}
      openPRs={open}
      mergedPRs={merged}
      homeHref="/ascii"
      homeLabel="← Back to OpenChaos"
    />
  );
}
